<?php
if ($object->xpdo) {
    switch ($options[xPDOTransport::PACKAGE_ACTION]) {
        case xPDOTransport::ACTION_INSTALL:

            /** @var modX $modx */
            $modx =& $object->xpdo;

            /** @var modSystemSetting $setting */
            $setting = $modx->getObject('modSystemSetting', ['key' => 'fred.icon_editor']);
            if ($setting) {
                $setting->set('value', 'FAEditor');
                $setting->save();
            }

            break;
            
        case xPDOTransport::ACTION_UPGRADE:

            /** @var modX $modx */
            $modx =& $object->xpdo;

            /** @var modSystemSetting $setting */
            $setting = $modx->getObject('modSystemSetting', ['key' => 'fredfaeditor.link']);
            if ($setting) {
                $setting->set('value', 'https://use.fontawesome.com/releases/v5.15.3/css/all.css');
                $setting->save();
            }

            break;
    }
}
return true;