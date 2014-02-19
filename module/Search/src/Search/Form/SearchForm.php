<?php

namespace Search\Form;

use Zend\Captcha;
use Zend\Form\Element;
use Zend\Form\Form;

class SearchForm extends Form {

    public function __construct($name = null) {
        parent::__construct('search');

        $this->removeAttribute('method');
        $this->setAttribute('class', 'searchForm');
        $this->removeAttribute('action');

        $this->add(array(
            'name' => 'urlsearch',
            'type' => 'Zend\Form\Element\Text',
            'attributes' => array(
                'placeholder' => 'SEO, PPC, PHP, Java etc...',
                'class' => 'textSearch',
                'id' => 'urlSearch'
            ),
            'options' => array(
                'label' => 'URL Search',
            ),
        ));

        $this->add(array(
            'name' => 'keywordsearch',
            'type' => 'Zend\Form\Element\Text',
            'attributes' => array(
                'placeholder' => 'SEO, PPC, PHP, Java etc...',
                'class' => 'textSearch',
                'id' => 'keywordSearch'
            ),
            'options' => array(
                'label' => 'Keyword Search',
            ),
        ));

        $this->add(array(
            'name' => 'default_operator',
            'type' => 'Zend\Form\Element\MultiCheckbox',
            'attributes' => array(
                'class' => 'searchOptions default_operator',
            ),
            'options' => array(
                'label' => ' ',
                'value_options' => array(
                    '1' => 'Lenient Search (results matching one of the filters)',
                ),
            ),
        ));

        $this->add(array(
            'name' => 'enableSlider',
            'type' => 'Zend\Form\Element\MultiCheckbox',
            'attributes' => array(
                'class' => 'searchOptions enableSlider',
            ),
            'options' => array(
                'label' => ' ',
                'value_options' => array(
                    '1' => ' ',
                ),
            ),
        ));
        $this->add(array(
            'name' => 'categories',
            'type' => 'Zend\Form\Element\MultiCheckbox',
            'attributes' => array(
                'class' => 'searchOptions cats',
                'value' => '0',
            ),
            'options' => array(
                'label' => 'Categories',
                'value_options' => array(
                    '1' => 'Entertainment',
                    '2' => 'Lifestyle',
                    '3' => 'Gaming',
                    '4' => 'Business',
                    '5' => 'Travel',
                    '6' => 'Fashion',
                    '7' => 'Automotive',
                    '8' => 'News',
                    '9' => 'Technology',
                    '10' => 'Telecom', //10
                ),
            ),
        ));

        $this->add(array(
            'name' => 'categories11-20',
            'type' => 'Zend\Form\Element\MultiCheckbox',
            'attributes' => array(
                'class' => 'searchOptions cats',
                'value' => '0',
            ),
            'options' => array(
                'label' => ucfirst(" "),
                'value_options' => array(
                    '11' => 'Economic',
                    '12' => 'Adult',
                    '13' => 'Gambling',
                    '14' => 'Sustainability',
                    '15' => 'Sports',
                    '16' => 'Art & Design',
                    '17' => 'Health',
                    '18' => 'Politics & Religion',
                    '19' => 'Education',
                    '20' => 'Local',
                ),
            ),
        ));

        $this->add(array(
            'name' => 'categories21-30',
            'type' => 'Zend\Form\Element\MultiCheckbox',
            'attributes' => array(
                'class' => 'searchOptions cats',
                'value' => '0',
            ),
            'options' => array(
                'label' => ucfirst(" "),
                'value_options' => array(
                    '21' => 'Love',
                    '22' => 'Horeca',
                    '23' => 'Beauty',
                    '24' => 'Hobby\'s',
                    '25' => 'Interior',
                    '26' => 'Internet',
                    '27' => 'Kids',
                    '28' => 'Logistics',
                    '29' => 'Jobs',
                    '30' => 'Property', //30
                ),
            ),
        ));

        $this->add(array(
            'name' => 'categories31-40',
            'type' => 'Zend\Form\Element\MultiCheckbox',
            'attributes' => array(
                'class' => 'searchOptions cats',
                'value' => '0',
            ),
            'options' => array(
                'label' => ucfirst(" "),
                'value_options' => array(
                    '31' => 'Gifts',
                    '32' => 'Culture',
                    '33' => 'Movies',
                    '34' => 'Going Out',
                    '35' => 'History',
                    '36' => 'Music',
                    '37' => 'Law',
                    '38' => 'Jewelry',
                    '39' => 'TV',
                    '40' => 'Others', //40
                ),
            ),
        ));

        $this->add(array(
            'name' => 'categories41-50',
            'type' => 'Zend\Form\Element\MultiCheckbox',
            'attributes' => array(
                'class' => 'searchOptions cats',
                'value' => '0',
            ),
            'options' => array(
                'label' => ucfirst(" "),
                'value_options' => array(
                    '41' => 'Charity',
                    '42' => 'Insurance',
                //'43' => 'Gambling',
                //'44' => 'Gambling',
                //'45' => 'Gambling', //45
                ),
            ),
        ));

        $this->add(array(
            'name' => 'languages',
            'type' => 'Zend\Form\Element\MultiCheckbox',
            'attributes' => array(
                'class' => 'searchOptions langs',
                'value' => '0',
            ),
            'options' => array(
                'label' => 'Language',
                'value_options' => array(
                    '1' => 'Dutch',
                    '2' => 'German',
                    '3' => 'Spanish',
                ),
            ),
        ));

        $this->add(array(
            'name' => 'languages',
            'type' => 'Zend\Form\Element\MultiCheckbox',
            'attributes' => array(
                'class' => 'searchOptions langs',
                'value' => '0',
            ),
            'options' => array(
                'label' => 'Language',
                'value_options' => array(
                    '1' => 'Dutch',
                    '2' => 'German',
                    '3' => 'Spanish',
                ),
            ),
        ));

        $this->add(array(
            'name' => 'searchButton',
            'type' => 'button',
            'attributes' => array(
                'class' => 'searchButton',
                'value' => 'goSearch',
                'onclick' => 'searchDatabaseNow()',
            ),
            'options' => array(
                'label' => 'Search!',
            ),
        ));
    }

}
