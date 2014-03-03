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
                    'dbname' => 'authtest'
                ),
            ),
        ),
    ),
);
