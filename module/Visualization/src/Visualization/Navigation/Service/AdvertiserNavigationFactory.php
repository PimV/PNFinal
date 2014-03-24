<?php

namespace Visualization\Navigation\Service;

use Zend\Navigation\Service\DefaultNavigationFactory;

class AdvertiserNavigationFactory extends DefaultNavigationFactory {

    protected function getName() {
        return 'advertiser_sidebar_navigation';
    }

}
