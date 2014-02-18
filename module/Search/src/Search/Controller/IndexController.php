<?php

/**
 * Zend Framework (http://framework.zend.com/)
 *
 * @link      http://github.com/zendframework/ZendSkeletonModule for the canonical source repository
 * @copyright Copyright (c) 2005-2014 Zend Technologies USA Inc. (http://www.zend.com)
 * @license   http://framework.zend.com/license/new-bsd New BSD License
 */

namespace Search\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;
use Search\Form\SearchForm;
use Search\Form\SearchFormValidator;
use Zend\Db\Adapter\Adapter;
use Zend\Db\Sql\Sql;

class IndexController extends AbstractActionController {

    public function indexAction() {

        $form = new SearchForm();
        $request = $this->getRequest();

        if ($request->isPost()) {


            //$formValidator = new SearchFormValidator();
            {
                // $form->setInputFilter($formValidator->getInputFilter());
                $form->setData($request->getPost());
            }

            if ($form->isValid()) {
                //$user->exchangeArray($form->getData());
            }
        }

        return ['form' => $form];
    }

    public function searchAction() {
        $this->buildSearchQueryBody();
    }

    private function buildSearchQueryBody() {
        $keywords;
        $priceRange;
        $categoryIds;
        $languageIds;

        $termsWords = null;
        $termsCatIds = null;
        $termsLangIds = null;
        $range = null;

        if (isset($_POST['keywords'])) {
            $keywords = trim($_POST['keywords']);
            if (strlen($keywords) > 0) {
                $keywords = explode(' ', $keywords);
                $termsWords = array(
                    "terms" => array(
                        "_all" =>
                        $keywords,
                        "minimum_should_match" => 1
                    ,
                    )
                );
            }
        }

        if (isset($_POST['langOpts'])) {
            $languageIds = $_POST['langOpts'];
            $termsLangIds = array(
                "terms" => array(
                    "lang_id" =>
                    $languageIds,
                    "minimum_should_match" => 1
                ,
                )
            );
        }
        if (isset($_POST['catOpts'])) {
            $categoryIds = $_POST['catOpts'];
            $termsCatIds = array(
                "terms" => array(
                    "cat_id" =>
                    $categoryIds,
                    "minimum_should_match" => 1
                ,
                )
            );
        }

        if (isset($_POST['priceRange']) && $_POST['priceRange'] != null) {
            $priceRange = $_POST['priceRange'];
            $range = array(
                "range" => array(
                    "price" => array(
                        "gte" => $priceRange[0],
                        "lte" => $priceRange[1]
                    )
                )
            );
        }

        //Set the body for the ElasticSearch cURL Post Request
        if (isset($_POST['operator'])) {
            $operator = $_POST['operator'];
            if ($operator === "AND") {
                $shouldArray = array();

                $mustArray = array();
                if (count($range) > 0) {
                    $mustArray[] = $range;
                }
                if (count($termsCatIds) > 0) {
                    $mustArray[] = $termsCatIds;
                }
                if (count($termsLangIds) > 0) {
                    $mustArray[] = $termsLangIds;
                }
                if (count($termsWords) > 0) {
                    $mustArray[] = $termsWords;
                }

                $mustNotArray = array();
            } else {
                $shouldArray = array();
                if (count($termsCatIds) > 0) {
                    $shouldArray[] = $termsCatIds;
                }
                if (count($termsLangIds) > 0) {
                    $shouldArray[] = $termsLangIds;
                }
                if (count($termsWords) > 0) {
                    $shouldArray[] = $termsWords;
                }

                $mustArray = array();
                if (count($range) > 0) {
                    $mustArray[] = $range;
                }

                $mustNotArray = array();
            }
        }

        //Check if no fields are entered. If so, show all results
        if (count($shouldArray) < 1 &&
                count($mustArray) < 1 &&
                count($mustNotArray) < 1) {

            $shouldArray = array("match_all" => array());
        }

        $body = array(
            "query" => array(
                "bool" => array(
                    "should" =>
                    $shouldArray
                    ,
                    "must" =>
                    $mustArray
                    ,
                    "must_not" =>
                    $mustNotArray
                )
            )
        );

        $url = "http://127.0.0.1:9200/jdbc/_search";

        $dataObject = json_encode($body);
        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $dataObject);

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $server_output = curl_exec($ch);

        curl_close($ch);

        echo $server_output;
        die;
    }

    public function initAction() {
        $url = "http://127.0.0.1:9200/jdbc/_search?pretty=true";
        $data = array(
            "facets" => array(
                "stat1" => array(
                    "statistical" => array(
                        "field" => "price"
                    )
                )
            )
        );
        $dataObject = json_encode($data);
        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $dataObject);

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $server_output = curl_exec($ch);

        curl_close($ch);

        echo $server_output;
        die;
    }

}
