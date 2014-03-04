<?php

namespace Application\Navigation\Service;

use Zend\Navigation\Service\DefaultNavigationFactory;

class MainNavigationFactory extends DefaultNavigationFactory {

    protected function getName() {
        return 'main_navigation';
    }

}
