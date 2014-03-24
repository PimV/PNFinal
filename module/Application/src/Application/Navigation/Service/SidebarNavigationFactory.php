<?php

namespace Application\Navigation\Service;

use Zend\Navigation\Service\DefaultNavigationFactory;

class SidebarNavigationFactory extends DefaultNavigationFactory {

    protected function getName() {
        return 'sidebar_navigation';
    }

}
