import type { NextPage } from 'next';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button, Table } from 'react-bootstrap';
import ReactPaginate from 'react-paginate';

import ModalDeleteCustom from '@commonItems/ModalDeleteCustom';
import { handleDeletingResponse } from '@commonServices/ResponseStatusHandlingService';
import type { WarehouseDetail } from '@inventoryModels/WarehouseDetail';
import { deleteWarehouse, getPageableWarehouses } from '@inventoryServices/WarehouseService';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE, WAREHOUSE_URL } from 'constants/Common';

const WarehouseList: NextPage = () => {
  const [warehouseIdWantToDelete, setWarehouseIdWantToDelete] = useState<number>(-1);
  const [warehouseNameWantToDelete, setWarehouseNameWantToDelete] = useState<string>('');
  const [showModalDelete, setShowModalDelete] = useState<boolean>(false);
  const [warehouses, setWarehouses] = useState<WarehouseDetail[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [pageNo, setPageNo] = useState<number>(DEFAULT_PAGE_NUMBER);
  const [totalPage, setTotalPage] = useState<number>(1);

  const handleClose: any = () => setShowModalDelete(false);
  const handleDelete: any = () => {
    if (warehouseIdWantToDelete == -1) {
      return;
    }
    deleteWarehouse(warehouseIdWantToDelete)
      .then((response) => {
        setShowModalDelete(false);
        handleDeletingResponse(response, warehouseNameWantToDelete);
        setPageNo(DEFAULT_PAGE_NUMBER);
        getListWarehouse();
      })
      .catch((error) => console.log(error));
  };
  const getListWarehouse = () => {
    getPageableWarehouses(pageNo, DEFAULT_PAGE_SIZE)
      .then((data) => {
        setTotalPage(data.totalPages);
        setWarehouses(data.warehouseContent);
        setLoading(false);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    setLoading(true);
    getListWarehouse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNo]);

  const changePage = ({ selected }: any) => {
    setPageNo(selected);
  };
  if (isLoading) return <p>Loading...</p>;
  if (!warehouses) return <p>No Warehouse</p>;
  return (
    <>
      <div className="row mt-5">
        <div className="col-md-8">
          <h2 className="text-danger font-weight-bold mb-3">Warehouse</h2>
        </div>
        <div className="col-md-4 text-right">
          <Link href={`${WAREHOUSE_URL}/create`}>
            <Button>Create warehouse</Button>
          </Link>
        </div>
      </div>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {warehouses.map((warehouse) => (
            <tr key={warehouse.id}>
              <td>{warehouse.id}</td>
              <td>{warehouse.name}</td>
              <td>
                <Link href={`${WAREHOUSE_URL}/${warehouse.id}/edit`}>
                  <button className="btn btn-outline-primary btn-sm" type="button">
                    Edit
                  </button>
                </Link>
                &nbsp;
                <button
                  className="btn btn-outline-danger btn-sm"
                  type="button"
                  onClick={() => {
                    setShowModalDelete(true);
                    setWarehouseIdWantToDelete(warehouse.id);
                    setWarehouseNameWantToDelete(warehouse.id.toString());
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <ModalDeleteCustom
        showModalDelete={showModalDelete}
        handleClose={handleClose}
        nameWantToDelete={warehouseNameWantToDelete}
        handleDelete={handleDelete}
        action="delete"
      />
      {totalPage > 1 && (
        <ReactPaginate
          forcePage={pageNo}
          previousLabel={'Previous'}
          nextLabel={'Next'}
          pageCount={totalPage}
          onPageChange={changePage}
          containerClassName={'pagination-container'}
          previousClassName={'previous-btn'}
          nextClassName={'next-btn'}
          disabledClassName={'pagination-disabled'}
          activeClassName={'pagination-active'}
        />
      )}
    </>
  );
};

export default WarehouseList;
