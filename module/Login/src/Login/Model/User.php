<?php

namespace Login\Model;

use Zend\Form\Annotation;

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * @Annotation\Hydrator("Zend\Stdlib\Hydrator\ObjectProperty")
 * @Annotation\Name("User")
 */
class User {

    /**
     * @Annotation\Name("username")
     * @Annotation\Required({"required":"true"})
     * @Annotation\Filter({"name":"StripTags"})
     * @Annotation\Options({"label":"Username"})
     * @Annotation\Attributes({"id":"username"})
     */
    public $username;

    /**
     * @Annotation\Name("password")
     * @Annotation\Type("Zend\Form\Element\Password")
     * @Annotation\Required({"required":"true"})
     * @Annotation\Filter({"name":"StripTags"})
     * @Annotation\Options({"label":"Password"})
     * @Annotation\Attributes({"id":"password"})
     */
    public $password;

    /**
     * @Annotation\Name("rememberme")
     * @Annotation\Type("Zend\Form\Element\Checkbox")
     * @Annotation\Options({"label":"Keep me logged in"})
     */
    public $rememberme;

    /**
     * @Annotation\Name("submit")
     * @Annotation\Type("Zend\Form\Element\Submit")
     * @Annotation\Attributes({"value":"Login"})
     */
    public $submit;

}
