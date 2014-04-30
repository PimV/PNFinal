<?php

/**
 * Global Configuration Override
 *
 * You can use this file for overriding configuration values from modules, etc.
 * You would place values in here that are agnostic to the environment and not
 * sensitive to security.
 *
 * @NOTE: In practice, this file will typically be INCLUDED in your source
 * control, so do not include passwords or other sensitive information in this
 * file.
 */
return array(
    'session' => array(
        'config' => array(
            'class' => 'Zend\Session\Config\SessionConfig',
            'options' => array(
                'use_cookies' => true,
                'use_only_cookies' => true,
                'name' => 'pubnext',
            ),
        ),
        'storage' => 'Zend\Session\Storage\SessionArrayStorage',
        'validators' => array(
            'Zend\Session\Validator\RemoteAddr',
            'Zend\Session\Validator\HttpUserAgent',
        ),
    ),
    'db' => array(
        'driver' => 'Pdo_Mysql',
        'dsn' => 'mysql:dbname=pnfinal;host=5.199.151.136;port=3306',
        //'database' => 'pnfinal',
        'username' => 'PimVerlangen',
        'password' => 'verlangen',
    //'hostname' => '5.199.151.136',
    // 'port' => '3306',
    ),
    'service_manager' => array(
        'factories' => array(
            'Zend\Db\Adapter\Adapter' => function ($serviceManager) {
        $adapterFactory = new Zend\Db\Adapter\AdapterServiceFactory();
        $adapter = $adapterFactory->createService($serviceManager);

        \Zend\Db\TableGateway\Feature\GlobalAdapterFeature::setStaticAdapter($adapter);

        return $adapter;
    }
        ),
    ),
    'API_config' => array(
        'username' => 'pim@sourcerepublic.com',
        'password' => 'c04E419379006f2203f1Ba51829cA87e'
    )
);
