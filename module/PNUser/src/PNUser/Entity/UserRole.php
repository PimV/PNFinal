<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace PNUser\Entity;

use BjyAuthorize\Provider\Role\ProviderInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use ZfcUser\Entity\UserInterface;

/**
 * An example of how to implement a role aware user entity.
 *
 * @ORM\Entity
 * @ORM\Table(name="user_role_linker")
 *
 * @author Tom Oram <tom@scl.co.uk>
 */
class UserRole {

    /**
     * @ORM\Id()
     * @ORM\OneToOne(targetEntity="PNUser\Entity\User", inversedBy="id")
     * @ORM\JoinColumn(name="user_id", referencedColumnName="id", nullable=false)
     * @ORM\Column(type="integer")
     */
    protected $user_id;

    /**
     * @ORM\Id()
     * @ORM\OneToOne(targetEntity="PNUser\Entity\Role", inversedBy="id")
     * @ORM\JoinColumn(name="role_id", referencedColumnName="id", nullable=false)
     * @ORM\Column(type="integer")
     */
    protected $role_id = 2;

    /**
     * Initial values, user_id = 0 will fail because there is no user with id 0.
     * role_id = 2 --> Advertiser
     * user_id = 0 --> None (will fail)
     */
    public function __construct() {
        $this->role_id = 2;
        $this->user_id = 0;
    }

    public function getUserId() {
        return $this->user_id;
    }

    public function getRoleId() {
        return $this->role_id;
    }

    /**
     * @var int
     * @param int $userId
     */
    public function setUserId($userId) {
        $this->user_id = $userId;
    }

    /**
     * @var int
     * @param int $roleId
     */
    public function setRoleId($roleId) {
        $this->role_id = $roleId;
    }

}
