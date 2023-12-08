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
  Spin,
  DatePicker,
  Pagination,
  Input,
  Popconfirm,
  message,
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import {
  WarningOutlined,
  CloseOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import axiosClient from "../libraries/axiosClient";
import moment from "moment";
import numeral from "numeral";
import "numeral/locales/vi";
numeral.locale("vi");

import styles from "./stylesPage/OrderMePage.module.scss";

const { Panel } = Collapse;
const { Option } = Select;
const DEFAULT_LIMIT = 10;
const OrderMePage = ({ role }) => {
  const navigate = useNavigate();
  //Trạng thái loading của button
  const [loadings, setLoadings] = useState([false]);

  const [id, setId] = useState("");
  const [status, setStatus] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [orders, setOrders] = useState([]);
  const [filterResult, setFilterResult] = useState([]);
  const [noFilterResult, setNoFilterResult] = useState(false);
  const [pagination, setPagination] = useState({
    total: 1,
    page: 1,
    pageSize: DEFAULT_LIMIT,
  });
  const [selectedStatusMap, setSelectedStatusMap] = useState({});

  const filterOrder = async () => {
    try {
      setLoadings([true]);
      const res = await axiosClient.get("/orders/filter/me", {
        params: {
          id,
          status: role === "SALES" ? "COMPLETED" : status,
          typeOrder: role === "SALES" ? false : true,
          paymentType,
          startDate: startDate ? startDate.format("YYYY-MM-DD") : "",
          endDate: endDate ? endDate.format("YYYY-MM-DD") : "",
        },
      });
      console.log("startDate:", startDate);
      console.log("endDate:", endDate);
      const Results = res.data.payload || [];
      setFilterResult(Results);
      setNoFilterResult(Results.length === 0);
      setLoadings([false]);
    } catch (error) {
      console.error("Lỗi khi gọi API: ", error);
      setLoadings([false]);
    }
  };
  const getOrder = useCallback(async (pagination) => {
    try {
      const res = await axiosClient.get(
        `/orders/me?page=${pagination.page}&pageSize=${pagination.pageSize}`
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
    getOrder(pagination);
    if (pagination.page === 1) {
      navigate(`/orders-me`);
    } else {
      navigate(`/orders-me?page=${pagination.page}`);
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
    filterOrder(id, status, paymentType, startDate, endDate);
  };

  const handleFilterOnEnter = (e) => {
    if (e.key === "Enter") {
      handleFilter();
    }
  };
  const setSelectedStatus = (record, value) => {
    setSelectedStatusMap((prev) => ({
      ...prev,
      [record._id]: value,
    }));
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
  const getStatusContent = (record) => {
    if (record.status === "COMPLETED") {
      return moment(record.updatedAt).format("DD/MM/YYYY");
    }
    if (
      record.status === "PLACED" ||
      record.status === "DELIVERING" ||
      record.status === "PREPARED"
    ) {
      return <p>_____</p>;
    } else {
      return (
        <p style={{ color: "#E31837", fontSize: "120%" }}>
          <CloseOutlined />
        </p>
      );
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
      key: "status",
      align: "center",

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
              return "#FF8E5B";
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
      responsive: ["lg"],
      render: (text, record) => (
        <p>
          {moment(
            role === "SALES" ? record.createdDate : record.updatedAt
          ).format("DD/MM/YYYY")}
        </p>
      ),
    },
    {
      title: "Ngày hoàn thành",
      dataIndex: "updatedAt",
      key: "updatedAt",
      align: "center",
      responsive: ["lg"],
      render: (text, record) => <p>{getStatusContent(record)}</p>,
    },
    {
      title: "Tổng số tiền",
      align: "right",
      responsive: ["sm"],
      render: (text, record) => {
        const orderTotal = record.productList.reduce((orderTotal, product) => {
          // Tính số tiền của từng sản phẩm trong đơn hàng
          const productTotal =
            product.price * product.quantity * (1 - product.discount / 100);
          // Cộng vào tổng tiền của đơn hàng
          return orderTotal + productTotal;
        }, 0);

        // Trừ giảm giá của đơn hàng để có số tiền thực tế thanh toán
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
      render: (text, record) => {
        const statusText = {
          CASH: "Tiền mặt",
          CARD: "Thẻ NH",
        }[record.paymentType]; // Sửa 'status' thành 'paymentType'

        return <span>{statusText}</span>; // Sửa { statusText } thành <span>{statusText}</span>
      },
    },
    {
      title: "Cập nhật trạng thái",
      key: "action",
      align: "center",
      render: (text, record) => {
        // Kiểm tra xem status có phải là "DELIVERING" không
        if (record.status === "DELIVERING") {
          return (
            <div style={{ display: "flex", alignItems: "center" }}>
              <Select
                style={{ width: "140px", marginRight: "10px" }}
                placeholder="Trạng thái"
                value={selectedStatusMap[record._id]}
                onChange={(value) => setSelectedStatus(record, value)}
              >
                <Option value="COMPLETED">Hoàn thành</Option>
                <Option value="FLAKER">Boom đơn hàng</Option>
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
            </div>
          );
        }

        // Nếu status không phải là "DELIVERING", hiển thị một component hoặc giá trị khác
        return <span>Không được cập nhật</span>;
      },
      // Ẩn cột nếu role là "SALES" hoặc status không phải là "DELIVERING"
      className: role === "SALES" ? styles.hiddenColumn : "",
    },
  ];
  const clearFilters = () => {
    setId("");
    setStatus("");
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
          bordered={false}
          defaultActiveKey={["searchFilter"]}
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
                  <Col xs={12} sm={12} md={8} lg={8} xl={6}>
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
                  {role === "SALES" ? null : (
                    <Col xs={12} sm={12} md={8} lg={8} xl={6}>
                      <Form.Item label="Trạng thái">
                        <Select
                          placeholder="Chọn trạng thái"
                          value={status}
                          onChange={(value) => setStatus(value)}
                        >
                          <Option value="COMPLETED">Đã hoàn thành</Option>
                          <Option value="DELIVERING">Đang vận chuyển</Option>
                          <Option value="FLAKER">Boom hàng</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  )}

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
                emptyText: <Spin size="large" />,
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
OrderMePage.propTypes = {
  role: PropTypes.string,
};

export default OrderMePage;
