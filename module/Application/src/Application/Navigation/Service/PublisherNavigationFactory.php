<?php

namespace Application\Navigation\Service;

use Zend\Navigation\Service\DefaultNavigationFactory;

class PublisherNavigationFactory extends DefaultNavigationFactory {

    protected function getName() {
        return 'publisher_navigation';
    }

}
