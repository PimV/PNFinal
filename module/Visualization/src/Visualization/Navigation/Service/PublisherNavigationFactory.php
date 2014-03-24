<?php

namespace Visualization\Navigation\Service;

use Zend\Navigation\Service\DefaultNavigationFactory;

class PublisherNavigationFactory extends DefaultNavigationFactory {

    protected function getName() {
        return 'publisher_sidebar_navigation';
    }

}
