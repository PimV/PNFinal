<?php

return array(
    'doctrine' => array(
        'connection' => array(
            'orm_default' => array(
                'driverClass' => 'Doctrine\DBAL\Driver\PDOMySql\Driver',
                'params' => array(
                    'host' => '5.199.151.136',
                    'port' => '3306',
                    'user' => 'PimVerlangen',
                    'password' => 'verlangen',
                    'dbname' => 'pnfinal'
                ),
            ),
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
);
