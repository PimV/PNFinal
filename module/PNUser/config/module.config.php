<?php

return array(
    'doctrine' => array(
        'driver' => array(
            'zfcuser_entity' => array(
                'class' => 'Doctring\ORM\Mapping\Driver\AnnotationDriver',
                'paths' => __DIR__ . '/../src/PNUser/Entity',
            ),
        ),
    ),
    'zfcuser' => array(
        'user_entity_class' => 'PNUser\Entity\User',
        'enable_default_entities' => false,
    ),
    'bjyauthorize' => array(
        'identity_provider' => 'BjyAuthorize\Provider\Identity\AuthenticationIdentityProvider',
        'role_providers' => array(
            'object_manager' => 'doctrine.entity_manager.orm_default',
            'role_entity_class' => 'PNUser\Entity\Role',
        ),
    ),
);
