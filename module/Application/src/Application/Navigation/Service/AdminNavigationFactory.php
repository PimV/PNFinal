<?php

namespace Application\Navigation\Service;

use Zend\Navigation\Service\DefaultNavigationFactory;

class AdminNavigationFactory extends DefaultNavigationFactory {

    protected function getName() {
        return 'administrator_navigation';
    }

}
