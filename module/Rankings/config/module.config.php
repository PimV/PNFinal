<?php

return array(
    'controllers' => array(
        'invokables' => array(
            'Rankings\Controller\Index' => 'Rankings\Controller\IndexController',
        ),
    ),
    'view_manager' => array(
        'template_path_stack' => array(
            'rankings' => __DIR__ . '/../view'
        ),
    ),
);
