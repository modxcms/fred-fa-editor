import * as iconFile from '@fortawesome/fontawesome-free/metadata/icon-families.json';
export default (fred, Editor, pluginTools) => {
    const { fredConfig } = pluginTools;
    const { div, label, i } = pluginTools.ui.els;
    const { select, toggle } = pluginTools.ui.ins;

    return class FAIconEditor extends Editor {
        static icons = [];

        init() {
            this.animation = {
                '': fredConfig.lng('fredfaeditor.none'),
                'fa-spin': fredConfig.lng('fredfaeditor.spin'),
                'fa-pulse': fredConfig.lng('fredfaeditor.pulse')
            };
            this.sizes = {
                '': fredConfig.lng('fredfaeditor.default'),
                'fa-xs': 'XS',
                'fa-sm': 'SM',
                'fa-lg': 'LG',
                'fa-2x': '2x',
                'fa-3x': '3x',
                'fa-4x': '4x',
                'fa-5x': '5x',
                'fa-6x': '6x',
                'fa-7x': '7x',
                'fa-8x': '8x',
                'fa-9x': '9x',
                'fa-10x': '10x'
            };
            this.pull = {
                '': fredConfig.lng('fredfaeditor.none'),
                'fa-pull-left': fredConfig.lng('fredfaeditor.left'),
                'fa-pull-right': fredConfig.lng('fredfaeditor.right')
            };
            this.state = this.parseClass((this.el.fredEl.constructor.getElValue(this.el) || ''));
            this.buildIcons();
        }

        buildIcons() {
            if (FAIconEditor.icons.length > 0) {
                return;
            }
            this.parseIcons(iconFile);
        }

        parseIcons(jsonFile) {
            const json = (typeof jsonFile === 'string') ? JSON.parse(jsonFile) : jsonFile;
            Object.keys(json).forEach(icon => {
                const iconData = json[icon];
                const iconTitle = icon;
                const iconSearchTerms = iconData['search']['terms'];
                let style = 'fa';
                if (typeof iconData['familyStylesByLicense'] !== "undefined" && iconData['familyStylesByLicense']['free'].length > 0) {
                    switch (iconData['familyStylesByLicense']['free'][0]['style']) {
                        case 'brands':
                            style = 'fab';
                            break;
                        case 'regular':
                            style = 'far';
                            break;
                        case 'solid':
                            style = 'fas';
                            break;
                    }
                }
                FAIconEditor.icons.push({
                    title: `${style} fa-${iconTitle}`,
                    searchTerms: iconSearchTerms
                });
            });

        }

        render() {
            const wrapper = div();

            //const preview = this.buildPreview();

            wrapper.appendChild(this.buildIconInput());
            wrapper.appendChild(select({
                label: 'fredfaeditor.size',
                name: 'size',
                options: this.sizes
            }, this.state.size, this.setStateValue));

            wrapper.appendChild(toggle({
                label: 'fredfaeditor.fixed_width',
                name: 'fixedWidth'
            }, this.state.fixedWidth, this.setStateValue));

            wrapper.appendChild(toggle({
                label: 'fredfaeditor.border',
                name: 'border'
            }, this.state.border, this.setStateValue));

            wrapper.appendChild(select({
                label: 'fredfaeditor.pull',
                name: 'pull',
                options: this.pull
            }, this.state.pull, this.setStateValue));

            wrapper.appendChild(select({
                label: 'fredfaeditor.animation',
                name: 'animation',
                options: this.animation
            }, this.state.animation, this.setStateValue));

            wrapper.appendChild(this.buildAttributesFields());
            wrapper.appendChild(this.buildPreview());

            return wrapper;
        }

        onSave() {
            Editor.prototype.onSave.call(this);

            this.el.fredEl.setElValue(this.el, this.buildClass());
        }

        buildPreview() {
            const wrapper = div(['fred--preview']);

            const labelEl = label('fredfaeditor.preview');

            this.preview = i();
            this.preview.className = this.buildClass();

            wrapper.appendChild(labelEl);
            wrapper.appendChild(this.preview);

            return wrapper;
        }

        buildIconInput() {
            const wrapper = div();

            const input = document.createElement('select');

            const labelEl = label('fredfaeditor.icon', ['fred--label-choices']);

            wrapper.appendChild(labelEl);
            wrapper.appendChild(input);

            const iconChoices = new pluginTools.Choices(input, {
                searchChoices: false,
                callbackOnCreateTemplates: function (template) {
                    const classNames = this.config.classNames;
                    return {
                        item: (data) => {
                            return template(`<i class="${data.value}"></i>}`);
                        },
                        choice: (data) => {
                            return template(`
                          <div class="${classNames.item} ${classNames.itemChoice} ${data.disabled ? classNames.itemDisabled : classNames.itemSelectable}" data-select-text="${data.value}" data-choice ${data.disabled ? 'data-choice-disabled aria-disabled="true"' : 'data-choice-selectable'} data-id="${data.id}" data-value="${data.value}" ${data.groupId > 0 ? 'role="treeitem"' : 'role="option"'}>
                              <i class="${data.value}"></i>
                          </div>
                        `);
                        },
                    };
                }
            });
            iconChoices.setChoices(FAIconEditor.icons, 'title', 'title');
            iconChoices.setValueByChoice([this.state.icon]);

            iconChoices.passedElement.addEventListener('choice', event => {
                this.setStateValue('icon', event.detail.choice.value);
                iconChoices.setChoices(FAIconEditor.icons, 'title', 'title', true);
            });

            iconChoices.passedElement.addEventListener('search', event => {
                const searchTerm = iconChoices.input.value;
                const results = [];

                FAIconEditor.icons.forEach(icon => {
                    const iconTitle = icon.title.split('-').splice(1).join('-');

                    if (iconTitle.indexOf(searchTerm) === 0) {
                        results.push(icon);
                    } else {
                        const searchTermFound = icon.searchTerms.some(term => {
                            return (term.indexOf(searchTerm) === 0);
                        });

                        if (searchTermFound) {
                            results.push(icon);
                        }
                    }
                });

                iconChoices.setChoices(results, 'title', 'title', true);
            });

            return wrapper;
        }

        onStateUpdate() {
            this.preview.className = this.buildClass();
        }

        parseClass(value) {
            let size = '';
            let fixedWidth = false;
            let border = false;
            let pull = '';
            let animation = '';

            value = value.split(' ');

            for (let sizeValue in this.sizes) {
                if (this.sizes.hasOwnProperty(sizeValue)) {
                    const sizeIndex = value.indexOf(sizeValue);
                    if (sizeIndex > -1) {
                        size = sizeValue;
                        value.splice(sizeIndex, 1);
                    }
                }
            }

            for (let pullValue in this.pull) {
                if (this.pull.hasOwnProperty(pullValue)) {
                    const pullIndex = value.indexOf(pullValue);
                    if (pullIndex > -1) {
                        pull = pullValue;
                        value.splice(pullIndex, 1);
                    }
                }
            }

            for (let animationValue in this.animation) {
                if (this.animation.hasOwnProperty(animationValue)) {
                    const animationIndex = value.indexOf(animationValue);
                    if (animationIndex > -1) {
                        animation = animationValue;
                        value.splice(animationIndex, 1);
                    }
                }
            }

            const fwIndex = value.indexOf('fa-fw');
            if (fwIndex > 0) {
                fixedWidth = true;
                value.splice(fwIndex, 1);
            }

            const borderIndex = value.indexOf('fa-border');
            if (borderIndex > 0) {
                border = true;
                value.splice(borderIndex, 1);
            }

            const icon = value.join(' ');

            return {
                ...(this.state),
                ...{
                    icon,
                    size,
                    fixedWidth,
                    border,
                    pull,
                    animation
                }
            };
        }

        buildClass() {
            let classString = this.state.icon;

            if (this.state.size !== '') {
                classString += ` ${this.state.size}`;
            }

            if (this.state.fixedWidth === true) {
                classString += ' fa-fw';
            }

            if (this.state.border === true) {
                classString += ' fa-border';
            }

            if (this.state.pull !== '') {
                classString += ` ${this.state.pull}`;
            }

            if (this.state.animation !== '') {
                classString += ` ${this.state.animation}`;
            }

            return classString;
        }
    }
}
