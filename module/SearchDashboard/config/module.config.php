<?php

return array(
    'router' => array(
        'routes' => array(
            'searchdashboard-hello-world' => array(
                'type' => 'Literal',
                'options' => array(
                    'route' => '/hello/world',
                    'defaults' => array(
                        'controller' => 'SearchDashboard\Controller\Hello',
                        'action' => 'world',
                    ),
                ),
            ),
        ),
    ),
    'controllers' => array(
        'invokables' => array(
            'SearchDashboard\Controller\Hello' => 'SearchDashboard\Controller\HelloController',
        ),
    ),
    'view_manager' => array(
        'template_path_stack' => array(
            'search-dashboard' => __DIR__ . '/../view'
        ),
    ),
);
