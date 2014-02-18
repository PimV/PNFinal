<?php

return array(
    'controllers' => array(
        'invokables' => array(
            'SeoMetrics\Controller\Index' => 'SeoMetrics\Controller\IndexController',
        ),
    ),
    'view_manager' => array(
        'template_path_stack' => array(
            'seo-metrics' => __DIR__ . '/../view'
        ),
    ),
);
