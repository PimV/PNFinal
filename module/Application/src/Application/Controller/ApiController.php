<?php

/**
 * Zend Framework (http://framework.zend.com/)
 *
 * @link      http://github.com/zendframework/ZendSkeletonApplication for the canonical source repository
 * @copyright Copyright (c) 2005-2014 Zend Technologies USA Inc. (http://www.zend.com)
 * @license   http://framework.zend.com/license/new-bsd New BSD License
 */

namespace Application\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\JsonModel;

class ApiController extends AbstractActionController {

    public function indexAction() {
        $api_helper = $this->getServiceLocator()->get('FlxOneApi');
        $array = json_decode($api_helper->get('/quick-stats/network?rollup=hourly&pretty=1'), true);
        $pixels = $array['response']['stats']['pixels'];
        if (isset($pixels)) {
            $index = count(array_keys($pixels)) - 1;
            if ($index < 0) {
                $index = 0;
            }
            echo json_encode($pixels[array_keys($pixels)[$index]]);
        }
        die;
    }

    public function pixelAction() {
        $helper = new \Application\Wrapper\ApiHelper();
        $api_helper = $this->getServiceLocator()->get('FlxOneApi');
        $array = json_decode($helper->getCurl()->get(ENDPOINT . '/quick-stats/network?rollup=hourly&pretty=1', '/quick-stats/network?rollup=hourly&pretty=1'), true);
        $pixels = $array['response']['stats']['pixels'];
        $count = (int) 0;
        if (isset($pixels)) {
            $count = (int) 0;
            foreach ($pixels as $pixel) {
                $count = $count + (int) $pixel;
            }
        }
        echo $count;
        die;
    }

}
