<?php

namespace Search\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;

class IndexController extends AbstractActionController {

    public function indexAction() {
        return array();
    }

    public function resultsAction() {
        $result = new ViewModel();
        $result->setTerminal(true);
        return $result;
    }

}
