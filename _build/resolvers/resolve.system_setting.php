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
    }
}
return true;