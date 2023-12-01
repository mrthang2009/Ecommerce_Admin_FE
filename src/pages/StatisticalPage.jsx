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
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [chartData, setChartData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [combinedData, setCombinedData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        moment.locale("vi");
        const response = await axiosClient.get(
          role === "MANAGE"
            ? `/orders/orders-by-year?year=${year}`
            : `/orders/orders-by-month?year=${year}&month=${month}`
        );
        const orders = response.data.payload;

        const getOrderCounts = () => {
          const counts = { total: Array.from({ length: 12 }, () => 0) };
          if (role === "MANAGE") {
            counts.online = Array.from({ length: 12 }, () => 0);
            counts.offline = Array.from({ length: 12 }, () => 0);
          }
          orders.forEach((order) => {
            const orderMonth = moment(order.createdDate).month();
            counts.total[orderMonth]++;
            if (role === "MANAGE") {
              order.isOnline
                ? counts.online[orderMonth]++
                : counts.offline[orderMonth]++;
            }
          });
          return counts;
        };

        const orderCounts = getOrderCounts();

        const createChartData = () =>
          Array.from({ length: 12 }, (_, month) => ({
            month: moment().month(month).format("MMMM"),
            total: orderCounts.total[month],
            ...(role === "MANAGE" && {
              online: orderCounts.online[month],
              offline: orderCounts.offline[month],
            }),
          }));

        setChartData(createChartData());

        if (role === "MANAGE") {
          // let totalOrders = 0;
          // const totalOnlineOrders = orderCounts.online.reduce(
          //   (acc, count) => acc + count,
          //   0
          // );
          // const totalOfflineOrders = orderCounts.offline.reduce(
          //   (acc, count) => acc + count,
          //   0
          // );
          // const totalOrders = totalOfflineOrders + totalOnlineOrders;
          // console.log("Total orders for the year:", totalOrders);
          // console.log("Total online orders for the year:", totalOnlineOrders);
          // console.log("Total offline orders for the year:", totalOfflineOrders);

          const createRevenueData = () =>
            Array.from({ length: 12 }, (_, month) => {
              const filterOrders = (isOnline) =>
                orders
                  .filter(
                    (order) =>
                      moment(order.createdDate).month() === month &&
                      order.isOnline === isOnline &&
                      order.status === "COMPLETED"
                  )
                  .reduce((total, order) => {
                    const orderTotal = order.productList.reduce(
                      (orderTotal, product) =>
                        orderTotal +
                        product.price *
                          product.quantity *
                          (1 - product.discount / 100),
                      0
                    );
                    return total + orderTotal;
                  }, 0);

              const onlineRevenue = filterOrders(true);
              const offlineRevenue = filterOrders(false);
              const totalRevenue = onlineRevenue + offlineRevenue;

              return {
                month: moment().month(month).format("MMMM"),
                onlineRevenue,
                offlineRevenue,
                totalRevenue,
              };
            });

          setRevenueData(createRevenueData());
        } else {
          const allDaysInMonth = Array.from(
            { length: moment().daysInMonth() },
            (_, i) => i + 1
          );

          const orderCounts = {
            total: Array(allDaysInMonth.length).fill(0),
          };

          orders.forEach((order) => {
            const day = moment(order.createdDate).date();
            orderCounts.total[day - 1]++;
          });

          const createChartData = () =>
            allDaysInMonth.map((day, index) => ({
              day,
              total: orderCounts.total[index],
            }));

          setChartData(createChartData());

          const createRevenueData = () =>
            allDaysInMonth.map((day) => {
              const dailyRevenue = orders
                .filter(
                  (order) =>
                    moment(order.createdDate).date() === day &&
                    order.status === "COMPLETED"
                )
                .reduce((total, order) => {
                  const orderTotal = order.productList.reduce(
                    (orderTotal, product) =>
                      orderTotal +
                      product.price * product.quantity * (1 - product.discount / 100),
                    0
                  );
          
                  //số tiền doanh thu thực tế sau khi vận chuyển và chiết khấu thêm
                  const amountPaidForOrder =
                    orderTotal - (order.orderDisscount || 0) + (order.totalFee || 0);
          
                  return total + amountPaidForOrder;
                }, 0);
              return {
                day,
                dailyRevenue,
              };
            });

          setRevenueData(createRevenueData());

          const createCombinedData = () =>
            createChartData().map((chartItem) => {
              const correspondingRevenueItem = createRevenueData().find(
                (revenueItem) => revenueItem.day === chartItem.day
              );

              return correspondingRevenueItem
                ? {
                    ...chartItem,
                    dailyRevenue: correspondingRevenueItem.dailyRevenue,
                  }
                : chartItem;
            });

          setCombinedData(createCombinedData());
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [month, year, role]);

  const handleChangeYear = (value) => setYear(value);
  const handleChangeMonth = (value) => setMonth(value);

  return (
    <main className="container">
      <Card
        span={24}
        title={
          <div className={styles.title}>
            <p>Thống kê doanh thu đơn hàng</p>
            <div className={styles.action}>
              {role !== "MANAGE" && (
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
              )}
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
                      tickFormatter={(value) =>
                        moment().month(value).format("MMMM")
                      }
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
                {/* <div className={styles.content}>
                  <p>Số liệu thống kê doanh thu năm {year}</p>
                  <p>
                    Doanh thu từ đơn hàng trực tiếp:{" "}
                    {numeral(totalOfflineOrders).format("0,0$")}
                  </p>
                  <p>
                    Doanh thu từ đơn hàng trực tuyến:{" "}
                    {numeral(totalOnlineOrders).format("0,0$")}
                  </p>
                  <p>Tổng doanh thu: {numeral(totalOrders).format("0,0$")}</p>
                </div> */}
                <ResponsiveContainer
                  className={styles.chartContainer}
                  width="100%"
                  height={400}
                >
                  <LineChart data={chartData}>
                    <XAxis
                      dataKey="month"
                      tickFormatter={(value) =>
                        moment().month(value).format("MMMM")
                      }
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
                {/* <div className={styles.content}>
                  <p>Số liệu thống kê đơn hàng năm {year}</p>
                  <p>Số đơn hàng trực tiếp: {totalOfflineOrders}</p>
                  <p>Số đơn hàng trực tuyến: {totalOnlineOrders}</p>
                  <p>Tổng số đơn hàng: {totalOrders}</p>
                </div> */}
              </>
            ) : (
              <>
                <ResponsiveContainer
                  className={styles.chartContainer}
                  width="100%"
                  height={400}
                >
                  <ComposedChart data={combinedData}>
                    <XAxis dataKey="day" />
                    <YAxis yAxisId="left"/>
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tickFormatter={(value) =>
                        `${numeral(value).format("0a")}`
                      }
                    />
                    <Tooltip
                      formatter={(value, name) =>
                        name === "Doanh thu"
                          ? `${numeral(value).format("0,0$")}`
                          : value
                      }
                    />
                    <Legend />
                    <Bar
                      yAxisId="right"
                      dataKey="dailyRevenue"
                      fill="green"
                      name="Doanh thu"
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="total"
                      stroke="#E31837"
                      name="Số đơn hàng"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
                {/* <div className={styles.content}>
                  <p>
                    Số liệu thống kê doanh và đơn hàng tháng {month} năm {year}
                  </p>
                  <p>
                    Doanh thu từ đơn hàng trực tiếp:{" "}
                    {numeral(combinedData?.[0]?.dailyRevenue).format("0,0$")}
                  </p>
                  <p>
                    Doanh thu từ đơn hàng trực tuyến:{" "}
                    {numeral(combinedData?.[0]?.total).format("0,0$")}
                  </p>
                  <p>
                    Tổng doanh thu:{" "}
                    {numeral(combinedData?.[0]?.total).format("0,0$")}
                  </p>
                </div> */}
              </>
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
