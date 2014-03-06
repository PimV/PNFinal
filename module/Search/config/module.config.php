<?php

return array(
    'router' => array(
        'routes' => array(
            'search' => array(
                'type' => 'Zend\Mvc\Router\Http\Literal',
                'options' => array(
                    'route' => '/search',
                    'defaults' => array(
                        'controller' => 'Search\Controller\Index',
                        'action' => 'index',
                    ),
                ),
                'may_terminate' => true,
                'child_routes' => array(
                    'advertiser' => array(
                        'type' => 'Segment',
                        'options' => array(
                            'route' => '/advertiser[/:action]',
                            'constraints' => array(
                                'action' => '[a-zA-Z][a-zA-Z0-9_-]*',
                            ),
                            'defaults' => array(
                                'controller' => 'Search\Controller\Advertiser',
                                'action' => 'index',
                            ),
                        ),
                    ),
                    'publisher' => array(
                        'type' => 'Segment',
                        'options' => array(
                            'route' => '/publisher[/:action]',
                            'constraints' => array(
                                'action' => '[a-zA-Z][a-zA-Z0-9_-]*',
                            ),
                            'defaults' => array(
                                'controller' => 'Search\Controller\Publisher',
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
            'search' => array(
                'label' => 'Search',
                'route' => 'search',
                'pages' => array(
                    '1' => array(
                        'route' => 'search/advertiser',
                    ),
                ),
            ),
        ),
        'publisher_navigation' => array(
            'search' => array(
                'label' => 'Search',
                'route' => 'search/publisher',
            )
        ),
    ),
    'controllers' => array(
        'invokables' => array(
            'Search\Controller\Index' => 'Search\Controller\IndexController',
            'Search\Controller\Advertiser' => 'Search\Controller\AdvertiserController',
            'Search\Controller\Publisher' => 'Search\Controller\PublisherController',
        ),
    ),
    'view_manager' => array(
        'template_path_stack' => array(
            'search' => __DIR__ . '/../view'
        ),
    ),
);
