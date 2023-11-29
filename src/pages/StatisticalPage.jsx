import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import PropTypes from "prop-types";
import { Card, Select, Spin } from "antd";
import axiosClient from "../libraries/axiosClient";
import numeral from "numeral";
import "numeral/locales/vi";
import moment from "moment";
import "moment/locale/vi";
import styles from "./stylesPage/StatisticalPage.module.scss";

const { Option } = Select;

numeral.locale("vi");
moment.locale("vi");

const StatisticalPage = ({ role }) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [chartData, setChartData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (role === "MANAGE") {
          // Thiết lập ngôn ngữ tiếng Việt cho moment
          moment.locale("vi");
          const response = await axiosClient.get(
            `/orders/orders-by-year?year=${year}`
          );
          const orders = response.data.payload;

          // Sử dụng object để lưu trữ số lượng đơn hàng theo từng loại
          const orderCounts = {
            total: Array.from({ length: 12 }, () => 0),
            online: Array.from({ length: 12 }, () => 0),
            offline: Array.from({ length: 12 }, () => 0),
          };

          orders.forEach((order) => {
            const month = moment(order.createdDate).month();
            orderCounts.total[month]++;

            // Kiểm tra nếu là đơn hàng online hoặc offline
            if (order.isOnline) {
              orderCounts.online[month]++;
            } else {
              orderCounts.offline[month]++;
            }
          });

          // Tạo dữ liệu cho biểu đồ đường
          const chartData = Array.from({ length: 12 }, (_, month) => ({
            month: moment().month(month).format("MMMM"),
            total: orderCounts.total[month],
            online: orderCounts.online[month],
            offline: orderCounts.offline[month],
          }));

          setChartData(chartData);

          // Tính lại doanh thu cho từng loại đơn hàng (online và offline)
          const revenueData = Array.from({ length: 12 }, (_, month) => {
            const onlineRevenue = orders
              .filter(
                (order) =>
                  moment(order.createdDate).month() === month &&
                  order.isOnline === true &&
                  order.status === "COMPLETED"
              )
              .reduce((total, order) => {
                // Tính tổng số tiền của mỗi đơn hàng online
                const orderTotal = order.productList.reduce(
                  (orderTotal, product) => {
                    // Tính số tiền của từng sản phẩm trong đơn hàng
                    const productTotal =
                      product.price *
                      product.quantity *
                      (1 - product.discount / 100);
                    // Cộng vào tổng tiền của đơn hàng online
                    return orderTotal + productTotal;
                  },
                  0
                );

                // Cộng vào tổng doanh thu của đơn hàng online
                return total + orderTotal;
              }, 0);

            const offlineRevenue = orders
              .filter(
                (order) =>
                  moment(order.createdDate).month() === month &&
                  order.isOnline === false &&
                  order.status === "COMPLETED"
              )
              .reduce((total, order) => {
                // Tính tổng số tiền của mỗi đơn hàng offline
                const orderTotal = order.productList.reduce(
                  (orderTotal, product) => {
                    // Tính số tiền của từng sản phẩm trong đơn hàng
                    const productTotal =
                      product.price *
                      product.quantity *
                      (1 - product.discount / 100);
                    // Cộng vào tổng tiền của đơn hàng offline
                    return orderTotal + productTotal;
                  },
                  0
                );

                // Cộng vào tổng doanh thu của đơn hàng offline
                return total + orderTotal;
              }, 0);

            const totalRevenue = onlineRevenue + offlineRevenue;

            return {
              month: moment().month(month).format("MMMM"),
              onlineRevenue,
              offlineRevenue,
              totalRevenue,
            };
          });

          setRevenueData(revenueData);
        // } else if (role === "SALES" || role === "SHIPPER") {
        //   // Thiết lập ngôn ngữ tiếng Việt cho moment
        //   moment.locale("vi");
        //   const response = await axiosClient.get(
        //     `/orders/orders-by-month?year=${year}&month=${month}`
        //   );
        //   const orders = response.data.payload;

        //   // Sử dụng object để lưu trữ số lượng đơn hàng theo từng loại
        //   const orderCounts = {
        //     total: Array.from({ length: 12 }, () => 0),
        //     online: Array.from({ length: 12 }, () => 0),
        //     offline: Array.from({ length: 12 }, () => 0),
        //   };

        //   orders.forEach((order) => {
        //     const month = moment(order.createdDate).month();
        //     orderCounts.total[month]++;

        //     // Kiểm tra nếu là đơn hàng online hoặc offline
        //     if (order.isOnline) {
        //       orderCounts.online[month]++;
        //     } else {
        //       orderCounts.offline[month]++;
        //     }
        //   });

        //   // Tạo dữ liệu cho biểu đồ đường
        //   const chartData = Array.from({ length: 12 }, (_, month) => ({
        //     month: moment().month(month).format("MMMM"),
        //     total: orderCounts.total[month],
        //     online: orderCounts.online[month],
        //     offline: orderCounts.offline[month],
        //   }));

        //   setChartData(chartData);

        //   // Tính lại doanh thu cho từng loại đơn hàng (online và offline)
        //   const revenueData = Array.from({ length: 12 }, (_, month) => {
        //     const onlineRevenue = orders
        //       .filter(
        //         (order) =>
        //           moment(order.createdDate).month() === month &&
        //           order.isOnline === true &&
        //           order.status === "COMPLETED"
        //       )
        //       .reduce((total, order) => {
        //         // Tính tổng số tiền của mỗi đơn hàng online
        //         const orderTotal = order.productList.reduce(
        //           (orderTotal, product) => {
        //             // Tính số tiền của từng sản phẩm trong đơn hàng
        //             const productTotal =
        //               product.price *
        //               product.quantity *
        //               (1 - product.discount / 100);
        //             // Cộng vào tổng tiền của đơn hàng online
        //             return orderTotal + productTotal;
        //           },
        //           0
        //         );

        //         // Cộng vào tổng doanh thu của đơn hàng online
        //         return total + orderTotal;
        //       }, 0);

        //     const offlineRevenue = orders
        //       .filter(
        //         (order) =>
        //           moment(order.createdDate).month() === month &&
        //           order.isOnline === false &&
        //           order.status === "COMPLETED"
        //       )
        //       .reduce((total, order) => {
        //         // Tính tổng số tiền của mỗi đơn hàng offline
        //         const orderTotal = order.productList.reduce(
        //           (orderTotal, product) => {
        //             // Tính số tiền của từng sản phẩm trong đơn hàng
        //             const productTotal =
        //               product.price *
        //               product.quantity *
        //               (1 - product.discount / 100);
        //             // Cộng vào tổng tiền của đơn hàng offline
        //             return orderTotal + productTotal;
        //           },
        //           0
        //         );

        //         // Cộng vào tổng doanh thu của đơn hàng offline
        //         return total + orderTotal;
        //       }, 0);

        //     const totalRevenue = onlineRevenue + offlineRevenue;

        //     return {
        //       month: moment().month(month).format("MMMM"),
        //       onlineRevenue,
        //       offlineRevenue,
        //       totalRevenue,
        //     };
        //   });

        //   setRevenueData(revenueData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [year, role]);

  const handleChangeYear = (value) => {
    setYear(value);
  };

  return (
    <main className="container">
      <Card
        span={24}
        title={
          <div className={styles.title}>
            <p>Thống kê doanh thu đơn hàng</p>
            <div className={styles.action}>
              <p>Năm:</p>
              <Select
                defaultValue={year.toString()}
                onChange={handleChangeYear}
              >
                {Array.from({ length: 10 }, (_, i) => (
                  <Option
                    key={i}
                    value={(new Date().getFullYear() - i).toString()}
                  >
                    {new Date().getFullYear() - i}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        }
      >
        {chartData && revenueData ? (
          <>
            <ResponsiveContainer
              className={styles.chartContainer}
              width="100%"
              height={400}
            >
              <BarChart data={revenueData}>
                <XAxis
                  dataKey="month"
                  tickFormatter={(value) => {
                    const formattedMonth = moment().month(value).format("MMMM");
                    return formattedMonth;
                  }}
                />
                <YAxis
                  tickFormatter={(value) => `${numeral(value).format("0a")}`}
                />
                <Tooltip
                  formatter={(value) => `${numeral(value).format("0,0$")}`}
                />
                <Legend />
                <Bar
                  dataKey="onlineRevenue"
                  fill="#FFC522"
                  name="Doanh thu trực tuyến"
                />
                <Bar
                  dataKey="offlineRevenue"
                  fill="#E31837"
                  name="Doanh thu trực tiếp"
                />
                <Bar dataKey="totalRevenue" fill="blue" name="Tổng doanh thu" />
              </BarChart>
            </ResponsiveContainer>
            <ResponsiveContainer
              className={styles.chartContainer}
              width="100%"
              height={400}
            >
              <LineChart data={chartData}>
                <XAxis
                  dataKey="month"
                  tickFormatter={(value) => {
                    const formattedMonth = moment().month(value).format("MMMM");
                    return formattedMonth;
                  }}
                />
                <YAxis />
                <CartesianGrid stroke="#eee" strokeDasharray="3 3" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="online"
                  stroke="#FFC522"
                  name="Đơn hàng trực tuyến"
                />
                <Line
                  type="monotone"
                  dataKey="offline"
                  stroke="#E31837"
                  name="Đơn hàng trực tiếp"
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="blue"
                  name="Tổng đơn hàng"
                />
              </LineChart>
            </ResponsiveContainer>
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <Spin size="large" />
          </div>
        )}
      </Card>
    </main>
  );
};
StatisticalPage.propTypes = {
  role: PropTypes.string,
};
export default StatisticalPage;
