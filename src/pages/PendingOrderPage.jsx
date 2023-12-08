import { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Form,
  Card,
  Divider,
  Select,
  Row,
  Col,
  Collapse,
  DatePicker,
  Pagination,
  Input,
  Popconfirm,
  message,
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { WarningOutlined, CheckOutlined } from "@ant-design/icons";
import axiosClient from "../libraries/axiosClient";
import moment from "moment";
import numeral from "numeral";
import "numeral/locales/vi";
import styles from "./stylesPage/ProductPage.module.scss";

const { Panel } = Collapse;
const { Option } = Select;
numeral.locale("vi");

const DEFAULT_LIMIT = 10;

const PendingOrderPage = ({ role }) => {
  //Trạng thái loading của button
  const navigate = useNavigate();
  const [loadings, setLoadings] = useState([false]);

  const [id, setId] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [orders, setOrders] = useState([]);
  const [filterResult, setFilterResult] = useState([]);
  const [noFilterResult, setNoFilterResult] = useState(false);
  const [selectedStatusMap, setSelectedStatusMap] = useState({});
  const [pagination, setPagination] = useState({
    total: 1,
    page: 1,
    pageSize: DEFAULT_LIMIT,
  });

  const filterOrder = async () => {
    try {
      setLoadings([true]);
      const res = await axiosClient.get("/orders/filter", {
        params: {
          id,
          status: role === "SALES" ? "PLACED" : "PREPARED",
          typeOrder: true,
          paymentType,
          startDate: startDate ? startDate.format("YYYY-MM-DD") : "",
          endDate: endDate ? endDate.format("YYYY-MM-DD") : "",
        },
      });
      const Results = res.data.payload || [];
      setFilterResult(Results);
      setNoFilterResult(Results.length === 0);
      setLoadings([false]);
    } catch (error) {
      console.error("Lỗi khi gọi API: ", error);
      setLoadings([false]);
    }
  };

  const getOrder = useCallback(async (pagination, role) => {
    try {
      let status = "";
      if (role === "SALES") {
        status = "PLACED";
      } else {
        status = "PREPARED";
      }
      const res = await axiosClient.get(
        `/orders/pending?page=${pagination.page}&pageSize=${pagination.pageSize}&status=${status}`
      );
      setOrders(res.data.payload);
      setPagination((prev) => ({
        ...prev,
        total: res.data.totalOrder,
      }));
    } catch (error) {
      console.log(error);
    }
  }, []);
  useEffect(() => {
    getOrder(pagination, role);
    if (pagination.page === 1) {
      navigate(`/pending-orders`);
    } else {
      navigate(`/pending-orders?page=${pagination.page}`);
    }
  }, [navigate, pagination.page, pagination.pageSize]);


  const onChangePage = useCallback(
    (page, pageSize) => {
      setPagination((prev) => ({
        ...prev,
        page,
        pageSize,
      }));
      getOrder();
    },
    [getOrder]
  );

  const handleFilter = () => {
    filterOrder();
  };

  const handleFilterOnEnter = (e) => {
    if (e.key === "Enter") {
      handleFilter();
    }
  };

  const handleUpdateStatus = async (record) => {
    const status = selectedStatusMap[record._id];
    if (status) {
      try {
        await axiosClient.patch(`/orders/status/${record._id}`, {
          newStatus: status,
        });
        getOrder();
        message.success("Cập nhật trạng thái đơn hàng thành công");
      } catch (error) {
        message.error("Cập nhật trạng thái đơn hàng thất bại");
        console.error("Lỗi khi cập nhật trạng thái đơn hàng: ", error);
      }
    } else {
      message.warning("Vui lòng chọn trạng thái trước khi xác nhận");
    }
  };

  const setSelectedStatus = (record, value) => {
    setSelectedStatusMap((prev) => ({
      ...prev,
      [record._id]: value,
    }));
  };
  const handleupdateEmployeeId = async (record) => {
    try {
      await axiosClient.patch(`/orders/status&employeeId/${record._id}`);
      getOrder();
      message.success("Cập nhật trạng thái đơn hàng thành công");
    } catch (error) {
      message.error("Cập nhật trạng thái đơn hàng thất bại");
      console.error("Lỗi khi cập nhật trạng thái đơn hàng: ", error);
    }
  };
  const columns = [
    {
      title: "STT",
      rowScope: "row",
      width: "1%",
      align: "center",
      responsive: ["lg"],
      render: function (text, record, index) {
        return (
          <span>
            {filterResult.length > 0
              ? index + 1
              : index + 1 + pagination.pageSize * (pagination.page - 1)}
          </span>
        );
      },
    },
    {
      title: "Mã đơn hàng",
      dataIndex: "_id",
      key: "_id",
      render: (text, record) => (
        <Link to={`/orders/${record._id}`}>{record._id}</Link>
      ),
    },
    {
      title: "Trạng thái đơn hàng",
      dataIndex: "status",
      width: "150px",
      key: "status",
      align: "center",
      responsive: ["sm"],
      render: (text, record) => {
        const statusText = {
          PLACED: "Đã đặt hàng",
          PREPARED: "Đã chuẩn bị xong",
          DELIVERING: "Đang vận chuyển",
          COMPLETED: "Đã hoàn thành",
          CANCELED: "Cửa hàng hủy",
          REJECTED: "Khách hàng hủy",
          FLAKER: "Boom hàng",
        }[record.status];
        const getStatusColor = (status) => {
          switch (status) {
            case "PLACED":
              return "blue";
            case "COMPLETED":
              return "green";
            case "DELIVERING":
              return "orange";
            case "PREPARED":
              return "#FFC522";
            default:
              return "#E31837";
          }
        };
        return (
          <p
            style={{
              color: getStatusColor(record.status),
              border: `1px solid ${getStatusColor(record.status)}`,
              borderRadius: "8px",
            }}
          >
            {statusText}
          </p>
        );
      },
    },
    {
      title: role === "SALES" ? "Ngày tạo đơn" : "Ngày tiếp nhận đơn",
      dataIndex: role === "SALES" ? "createdDate" : "updatedAt",
      key: role === "SALES" ? "createdDate" : "updatedAt",
      align: "center",
      responsive: ["sm"],
      render: (text, record) => (
        <p>
          {moment(
            role === "SALES" ? record.createdDate : record.updatedAt
          ).format("DD/MM/YYYY")}
        </p>
      ),
    },
    {
      title: "Tổng số tiền",
      align: "right",
      responsive: ["sm"],
      render: (text, record) => {
        const orderTotal = record.productList.reduce((orderTotal, product) => {
          const productTotal =
            product.price * product.quantity * (1 - product.discount / 100);
          return orderTotal + productTotal;
        }, 0);
        const amountPaidForOrder =
          orderTotal - (record.orderDisscount || 0) + (record.totalFee || 0);
        return numeral(amountPaidForOrder).format("0,0$");
      },
    },
    {
      title: "Hình thức thanh toán",
      dataIndex: "paymentType",
      key: "paymentType",
      align: "center",
      responsive: ["xl"],
      render: (text, record) => {
        const statusText = {
          CASH: "Tiền mặt",
          CARD: "Thẻ NH",
        }[record.paymentType];
        return <span>{statusText}</span>;
      },
    },
    {
      title: "Cập nhật trạng thái",
      key: "action",
      align: "center",
      width: "20px",
      render: (text, record) => {
        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            {role === "SALES" ? (
              <>
                <Select
                  style={{ width: "140px", marginRight: "10px" }}
                  placeholder="Trạng thái"
                  value={selectedStatusMap[record._id]}
                  onChange={(value) => setSelectedStatus(record, value)}
                >
                  <Option value="PREPARED">Chuẩn bị xong</Option>
                  <Option value="CANCELED">Hủy đơn hàng</Option>
                </Select>
                <Popconfirm
                  placement="topRight"
                  title={`Xác nhận thay đổi trạng thái đơn hàng này?`}
                  onConfirm={() => handleUpdateStatus(record)}
                  okText="Xác nhận"
                  cancelText="Hủy"
                >
                  <Button type="dashed" icon={<CheckOutlined />} />
                </Popconfirm>
              </>
            ) : (
              <Popconfirm
                placement="topRight"
                title={`Xác nhận bạn vận chuyển đơn hàng này?`}
                onConfirm={() => handleupdateEmployeeId(record)}
                okText="Xác nhận"
                cancelText="Hủy"
              >
                <Button type="dashed" icon={<CheckOutlined />} />
              </Popconfirm>
            )}
          </div>
        );
      },
    },
  ];

  const clearFilters = () => {
    setId("");
    setPaymentType("");
    setStartDate(null);
    setEndDate(null);
    setFilterResult([]);
    setNoFilterResult(false);
    getOrder();
  };

  return (
    <main className="container">
      <Card>
        <Collapse
          defaultActiveKey={["searchFilter"]}
          bordered={false}
          style={{ backgroundColor: "#E6F4FF" }}
        >
          <Panel header="Bộ lọc tìm kiếm đơn hàng" key="searchFilter">
            <div className={styles.filter}>
              <Form>
                <Row gutter={16}>
                  <Col xs={24} sm={12} md={8} lg={8} xl={6}>
                    <Form.Item label="Mã ĐH">
                      <Input
                        placeholder="Nhập mã đơn hàng"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        onPressEnter={handleFilterOnEnter}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={24} md={8} lg={8} xl={6}>
                    <Form.Item label="Hình thức TT">
                      <Select
                        placeholder="Chọn hình thức TT"
                        value={paymentType}
                        onChange={(value) => setPaymentType(value)}
                      >
                        <Option value="CASH">Tiền mặt</Option>
                        <Option value="CARD">Thẻ</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={12} md={8} lg={8} xl={6}>
                    <Form.Item label="Từ ngày">
                      <DatePicker
                        value={startDate}
                        onChange={(date) => setStartDate(date)}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={12} md={8} lg={8} xl={6}>
                    <Form.Item label="Đến ngày">
                      <DatePicker
                        value={endDate}
                        onChange={(date) => setEndDate(date)}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={8} xl={6}>
                    <Button
                      loading={loadings[0]}
                      type="primary"
                      onClick={handleFilter}
                    >
                      Lọc
                    </Button>
                    <Button
                      onClick={clearFilters}
                      style={{ marginLeft: "10px" }}
                    >
                      Xóa bộ lọc
                    </Button>
                  </Col>
                </Row>
              </Form>
            </div>
          </Panel>
        </Collapse>
        <Divider />

        {noFilterResult ? (
          <Table
            style={{ backgroundColor: "#E6F4FF" }}
            columns={columns}
            pagination={false}
            rowKey="_id"
            locale={{
              emptyText: (
                <span style={{ fontSize: "110%" }}>
                  <WarningOutlined style={{ color: "#FFC522" }} /> Không tìm
                  thấy đơn hàng khả dụng
                </span>
              ),
            }}
          />
        ) : (
          <>
            <Table
              style={{ backgroundColor: "#E6F4FF" }}
              columns={columns}
              dataSource={filterResult.length > 0 ? filterResult : orders}
              pagination={false}
              rowKey="_id"
              locale={{
                emptyText: (
                  <span style={{ fontSize: "110%" }}>
                    <WarningOutlined style={{ color: "#FFC522" }} /> Không tìm
                    thấy đơn hàng khả dụng
                  </span>
                ),
              }}
            />
            {filterResult.length > 0 || orders.length === 0 ? null : (
              <div className={styles.pagination}>
                <Pagination
                  defaultCurrent={1}
                  total={pagination.total}
                  pageSize={DEFAULT_LIMIT}
                  current={pagination.page}
                  onChange={onChangePage}
                />
              </div>
            )}
          </>
        )}
      </Card>
    </main>
  );
};
PendingOrderPage.propTypes = {
  role: PropTypes.string,
};
export default PendingOrderPage;
