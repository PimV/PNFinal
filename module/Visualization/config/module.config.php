<?php

return array(
    'router' => array(
        'routes' => array(
            'visualization' => array(
                'type' => 'Zend\Mvc\Router\Http\Literal',
                'options' => array(
                    'route' => '/visualization',
                    'defaults' => array(
                        'controller' => 'Visualization\Controller\Index',
                        'action' => 'index',
                    ),
                ),
                'may_terminate' => true,
                'child_routes' => array(
                    'advertiser' => array(
                        'type' => 'Segment',
                        'options' => array(
                            'route' => '/advertiser[/:action[/:id]]',
                            'constraints' => array(
                                'action' => '[a-zA-Z][a-zA-Z0-9_-]*',
                                'id' => '[0-9]+',
                            ),
                            'defaults' => array(
                                'controller' => 'Visualization\Controller\Advertiser',
                                'action' => 'index',
                            ),
                        ),
                    ),
                    'publisher' => array(
                        'type' => 'Segment',
                        'options' => array(
                            'route' => '/publisher[/:action[/:id]]',
                            'constraints' => array(
                                'action' => '[a-zA-Z][a-zA-Z0-9_-]*',
                                'id' => '[0-9]+',
                            ),
                            'defaults' => array(
                                'controller' => 'Visualization\Controller\Publisher',
                                'action' => 'index',
                            ),
                        ),
                    ),
                ),
            ),
        ),
    ),
    'navigation' => array(
        'advertiser_navigation' => array(
            'visualization' => array(
                'label' => 'Performance',
                'route' => 'visualization/advertiser',
            ),
        ),
        'publisher_navigation' => array(
            'visualization' => array(
                'label' => 'Performance',
                'route' => 'visualization/publisher',
            ),
        ),
        'publisher_sidebar_navigation' => array(
        ),
    ),
    'controllers' => array(
        'invokables' => array(
            'Visualization\Controller\Index' => 'Visualization\Controller\IndexController',
            'Visualization\Controller\Advertiser' => 'Visualization\Controller\AdvertiserController',
            'Visualization\Controller\Publisher' => 'Visualization\Controller\PublisherController',
        ),
    ),
    'view_manager' => array(
        'template_path_stack' => array(
            'visualization' => __DIR__ . '/../view',
        ),
    ),
    'service_manager' => array(
    ),
);
