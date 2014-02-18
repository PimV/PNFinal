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
            'name' => 'text',
            'type' => 'Zend\Form\Element\Text',
            'attributes' => array(
                'placeholder' => 'SEO, PPC, PHP, Java etc...',
                'class' => 'textSearch',
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
                    '1' => 'Animals',
                    '2' => 'Computer',
                    '3' => 'Diet',
                    '4' => 'Education',
                    '5' => 'Entertainment',
                    '6' => 'Finance',
                    '7' => 'Health',
                    '8' => 'Internet',
                    '9' => 'Misc',
                    '10' => 'Nature',
                    '11' => 'Realestate',
                    '12' => 'Shopping',
                    '13' => 'Telecom',
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
