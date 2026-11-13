// ApexCharts, trimmed to what the details page draws. Imported lazily (see
// LazyChart.js) so the library is only downloaded on details pages.
//
// react-apexcharts/core wraps the bare ApexCharts core; each side-effect
// import below registers one chart family on it.
import Chart from "react-apexcharts/core";
import "apexcharts/radialBar"; // score gauge
import "apexcharts/bar"; // score distribution, member status
import "apexcharts/line"; // episode scores
import "apexcharts/features/legend";
import "apexcharts/features/toolbar"; // zoom/reset on the episode chart
import "apexcharts/features/keyboard"; // keyboard navigation of data points

export default Chart;
