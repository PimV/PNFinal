<?php

namespace Visualization\Model;

use Zend\Db\TableGateway\TableGateway;

class SiteUserTable {

    protected $tableGateway;

    public function __construct(TableGateway $tableGateway) {
        $this->tableGateway = $tableGateway;
    }

    public function fetchAll() {
        $resultSet = $this->tableGateway->select();
        return $resultSet;
    }

    public function getSiteUser($id) {
        $id = (int) $id;
        $rowset = $this->tableGateway->select(array('id' => $id));

        $row = $rowset->current();

        if (!$row) {
            throw new Exception("Could not find row $id");
        }
        return $row;
    }

    public function get_sites_by_user($user_id) {
        $user_id = (int) $user_id;
        $rowset = $this->tableGateway->select(array('user_id' => $user_id));


        return $rowset;
    }

    public function saveSiteUser(SiteUser $site_user) {
        $data = array(
            'user_id' => $site_user->title,
            'site_id' => $site_user->url,
        );

        $id = (int) $site_user->id;
        if ($id === 0) {
            $this->tableGateway->insert($data);
        } else {
            if ($this->getSiteUser($id)) {
                $this->tableGateway->update($data, array('id' => $id));
            } else {
                throw new Exception("Form id does not exist");
            }
        }
    }

    public function deleteSite($id) {
        $this->tableGateway->delete(array('id' => $id));
    }

}
