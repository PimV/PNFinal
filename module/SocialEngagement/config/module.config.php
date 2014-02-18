<?php

return array(
    'controllers' => array(
        'invokables' => array(
            'SocialEngagement\Controller\Index' => 'SocialEngagement\Controller\IndexController',
        ),
    ),
    'view_manager' => array(
        'template_path_stack' => array(
            'social-engagement' => __DIR__ . '/../view'
        ),
    ),
);
