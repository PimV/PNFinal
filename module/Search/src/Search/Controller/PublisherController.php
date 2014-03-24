<?php

namespace Search\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Search\Form\SearchForm;

class PublisherController extends AbstractActionController {

    public function indexAction() {
        $form = new SearchForm();

        $form->initPublisher();
        $request = $this->getRequest();

        if ($request->isPost()) { {
                $form->setData($request->getPost());
            }

            if ($form->isValid()) {
                
            }
        }

        return ['form' => $form];
    }

    public function searchAction() {
        $this->buildSearchQueryBody();
    }

    /**
     * Not used due to no price-slider!
     */
    public function initAction() {
        $url = "http://127.0.0.1:9200/sites_source/_search?pretty=true";
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

    private function buildSearchQueryBody() {
        //Data variables
        $keywords;
        $priceRange;
        $categoryIds;
        $languageIds;

        //Body variables
        $termsURL = null;
        $termsKeywords = null;
        $termsCatIds = null;
        $termsLangIds = null;
        $range = null;

        //Set keywords array for cURL body
        if (isset($_POST['url'])) {
            $urls = trim($_POST['url']);
            if (strlen($urls) > 0) {
                $urls = explode(' ', $urls);
                $urlQueryString = "";
                foreach ($urls as $singleURL) {
                    $urlQueryString .= "*" . $singleURL . "* OR ";
                }
                $urlQueryString = substr($urlQueryString, 0, strlen($urlQueryString) - 3);
                $termsURL = array(
                    "query_string" => array(
                        "query" => $urlQueryString,
                        "fields" => array("name", "description")
                    )
                );
            }
        }
        if (isset($_POST['keywords'])) {
            $keywords = trim($_POST['keywords']);
            if (strlen($keywords) > 0) {
                $keywords = explode(' ', $keywords);
                $termsKeywords = array(
                    "terms" => array(
                        "keywords" => $keywords
                    )
                );
            }
        }
        //Set languageId array for cURL body
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
        //Set categoryId array for cURL body
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
        //Set range array for cURL body (always on MUST)
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
            $shouldArray = array();
            $mustArray = array();
            $mustNotArray = array();

            $shouldArray = $this->appendToArray($termsKeywords, $shouldArray);
            $shouldArray = $this->appendToArray($termsURL, $shouldArray);
            if ($operator === "AND") {


                // $mustArray = array();
                $mustArray = $this->appendToArray($range, $mustArray);
                $mustArray = $this->appendToArray($termsCatIds, $mustArray);
                $mustArray = $this->appendToArray($termsLangIds, $mustArray);

                $mustNotArray = array();
            } else {
                //$shouldArray = array();
                $shouldArray = $this->appendToArray($termsCatIds, $shouldArray);
                $shouldArray = $this->appendToArray($termsLangIds, $shouldArray);


                //$mustArray = array();
                $mustArray = $this->appendToArray($range, $mustArray);

                //$mustNotArray = array();
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

        $url = "http://127.0.0.1:9200/sites_source/_search";
        $pagination = "?from=&size=10";
        if (isset($_POST['page'])) {
            $page = $_POST['page'];
        } else {
            $page = 1;
        }
        $pagination = '?from=' . (($page - 1) * 10) . '&size=10';
        $url = $url . $pagination;
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

    private function appendToArray($arrayToAppend, $appendTo) {
        if (count($arrayToAppend) > 0) {
            $appendTo[] = $arrayToAppend;
        }
        return $appendTo;
    }

}
