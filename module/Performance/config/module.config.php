<?php

return array(
    'controllers' => array(
        'invokables' => array(
            'Performance\Controller\Index' => 'Performance\Controller\IndexController',
        ),
    ),
    'view_manager' => array(
        'template_path_stack' => array(
            'performance' => __DIR__ . '/../view'
        ),
    ),
);
