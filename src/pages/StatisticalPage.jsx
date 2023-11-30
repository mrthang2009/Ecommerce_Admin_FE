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
  ComposedChart,
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
  const [month, setMonth] = useState(new Date().getMonth() + 1); // Thêm state cho tháng
  const [chartData, setChartData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [combinedData, setCombinedData] = useState(null);

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
        } else if (role === "SALES" || role === "SHIPPER") {
          moment.locale("vi");
          const response = await axiosClient.get(
            `/orders/orders-by-month?year=${year}&month=${month}`
          );
          const orders = response.data.payload;
          // Tạo một mảng chứa tất cả các ngày trong tháng
          const allDaysInMonth = Array.from(
            { length: moment().daysInMonth() },
            (_, i) => i + 1
          );

          // Sử dụng object để lưu trữ số lượng đơn hàng tổng cộng cho mỗi ngày
          const orderCounts = {
            total: Array(allDaysInMonth.length).fill(0),
          };

          orders.forEach((order) => {
            const day = moment(order.createdDate).date(); // Lấy ngày từ ngày tạo đơn hàng
            orderCounts.total[day - 1]++; // Trừ đi 1 vì ngày bắt đầu từ 1
          });

          const chartData = allDaysInMonth.map((day, index) => ({
            day: day,
            total: orderCounts.total[index],
          }));

          setChartData(chartData);

          // Tính lại doanh thu cho từng ngày
          const revenueData = allDaysInMonth.map((day) => {
            const dailyRevenue = orders
              .filter(
                (order) =>
                  moment(order.createdDate).date() === day &&
                  order.status === "COMPLETED"
              )
              .reduce((total, order) => {
                // Tính tổng số tiền của mỗi đơn hàng
                const orderTotal = order.productList.reduce(
                  (orderTotal, product) => {
                    // Tính số tiền của từng sản phẩm trong đơn hàng
                    const productTotal =
                      product.price *
                      product.quantity *
                      (1 - product.discount / 100);
                    // Cộng vào tổng tiền của đơn hàng
                    return orderTotal + productTotal;
                  },
                  0
                );
                // Cộng vào tổng doanh thu của đơn hàng
                return total + orderTotal;
              }, 0);

            return {
              day: day,
              dailyRevenue,
            };
          });

          setRevenueData(revenueData);
          const combinedData = chartData.map((chartItem) => {
            // Tìm phần tử tương ứng trong revenueData
            const correspondingRevenueItem = revenueData.find(
              (revenueItem) => revenueItem.day === chartItem.day
            );

            // Nếu tìm thấy, thêm thông tin vào phần tử của chartData
            if (correspondingRevenueItem) {
              return {
                ...chartItem,
                dailyRevenue: correspondingRevenueItem.dailyRevenue,
              };
            }

            // Nếu không tìm thấy, trả lại phần tử của chartData không thay đổi
            return chartItem;
          });
          setCombinedData(combinedData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [month, year, role]);

  const handleChangeYear = (value) => {
    setYear(value);
  };

  const handleChangeMonth = (value) => {
    setMonth(value);
  };

  return (
    <main className="container">
      <Card
        span={24}
        title={
          <div className={styles.title}>
            <p>Thống kê doanh thu đơn hàng</p>
            <div className={styles.action}>
              {role !== "MANAGE" ? (
                <>
                  <p>Tháng:</p>
                  <Select
                    defaultValue={month.toString()}
                    onChange={handleChangeMonth}
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <Option key={i + 1} value={(i + 1).toString()}>
                        {i + 1}
                      </Option>
                    ))}
                  </Select>
                </>
              ) : null}
              <p style={{ marginLeft: "10px" }}>Năm:</p>
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
            {role === "MANAGE" ? (
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
                        const formattedMonth = moment()
                          .month(value)
                          .format("MMMM");
                        return formattedMonth;
                      }}
                    />
                    <YAxis
                      tickFormatter={(value) =>
                        `${numeral(value).format("0a")}`
                      }
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
                    <Bar
                      dataKey="totalRevenue"
                      fill="green"
                      name="Tổng doanh thu"
                    />
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
                        const formattedMonth = moment()
                          .month(value)
                          .format("MMMM");
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
                      stroke="green"
                      name="Tổng đơn hàng"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </>
            ) : (
              <ResponsiveContainer
                className={styles.chartContainer}
                width="100%"
                height={400}
              >
                <ComposedChart data={combinedData}>
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="left" />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickFormatter={(value) => `${numeral(value).format("0a")}`}
                  />
                  <Tooltip
                    formatter={(value, name) =>
                      name === "Doanh thu"
                        ? `${numeral(value).format("0,0$")}`
                        : value
                    }
                  />{" "}
                  <Legend />
                  <Bar
                    yAxisId="right" // Chuyển sang trục y bên phải
                    dataKey="dailyRevenue"
                    fill="green"
                    name="Doanh thu"
                  />
                  <Line
                    yAxisId="left" // Giữ trục y bên trái
                    type="monotone"
                    dataKey="total"
                    stroke="#E31837"
                    name="Số đơn hàng"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
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
