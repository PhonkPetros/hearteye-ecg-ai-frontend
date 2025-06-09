import {
  CategoryScale,
  Chart,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import React, { useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import Modal from "react-modal";
import logger from "../logger";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Filler,
  Title,
  Legend
);

// ECG grid plugin
const ecgGridPlugin = {
  id: "ecgGrid",
  beforeDraw: (chart: Chart) => {
    try {
      const { ctx, chartArea, scales } = chart;
      if (!ctx || !chartArea || !scales?.x || !scales?.y) {
        logger.warn("ECG Grid Plugin: Missing chart context or scales");
        return;
      }
      const { left, right, top, bottom } = chartArea;
      const xScale = scales.x;
      const yScale = scales.y;

      ctx.save();
      ctx.fillStyle = "#fff5f5";
      ctx.fillRect(left, top, right - left, bottom - top);

      const pxPerSec = xScale.getPixelForValue(1) - xScale.getPixelForValue(0);
      const pxPerMv = yScale.getPixelForValue(0) - yScale.getPixelForValue(1);

      const mmHoriz = pxPerSec * 0.04;
      const mmVert = pxPerMv * 0.1;

      const zeroX = xScale.getPixelForValue(0);
      const zeroY = yScale.getPixelForValue(0);

      for (let px = left; px <= right; px += mmHoriz) {
        const offsetFromZero = px - zeroX;
        const isBold = Math.round(offsetFromZero / mmHoriz) % 5 === 0;

        ctx.beginPath();
        ctx.strokeStyle = isBold ? "#faa" : "#fdd";
        ctx.lineWidth = isBold ? 1 : 0.5;
        ctx.moveTo(px, top);
        ctx.lineTo(px, bottom);
        ctx.stroke();
      }

      for (let py = top; py <= bottom; py += mmVert) {
        const offsetFromZero = py - zeroY;
        const isBold = Math.round(offsetFromZero / mmVert) % 5 === 0;

        ctx.beginPath();
        ctx.strokeStyle = isBold ? "#faa" : "#fdd";
        ctx.lineWidth = isBold ? 1 : 0.5;
        ctx.moveTo(left, py);
        ctx.lineTo(right, py);
        ctx.stroke();
      }

      ctx.restore();
    } catch (error) {
      logger.error("Error in ecgGridPlugin beforeDraw:", error);
    }
  },
};

type Lead = {
  lead_name: string;
  samples: number[];
};

interface CleanedLeadsResponse {
  fs: number;
  leads: Lead[];
}

interface ECGPlotProps {
  lead: Lead;
  fs: number;
  startSec?: number;
  durationSec?: number;
  width?: number;
  height?: number;
}

const SMALL_SQUARE_PX = 6; // size of each small square in pixels
const VERTICAL_SQUARES = 24; // vertical squares for ±1.2mV @ 0.1mV step

const ECGPlot: React.FC<ECGPlotProps> = ({
  lead,
  fs,
  startSec = 0,
  durationSec = 2.5,
  width,
  height,
}) => {
  // Validate inputs early
  if (!lead?.samples || lead.samples.length === 0) {
    logger.warn(`ECGPlot: Lead ${lead?.lead_name} has no samples`);
    return <div>No ECG data available for lead {lead?.lead_name}</div>;
  }
  if (!fs || fs <= 0) {
    logger.error("ECGPlot: Invalid sampling frequency", fs);
    return <div>Invalid sampling frequency.</div>;
  }

  const yMin = -1.2;
  const yMax = 1.2;

  const computedHeight = height ?? VERTICAL_SQUARES * SMALL_SQUARE_PX;

  // Defensive slicing
  const startIndex = Math.max(0, Math.floor(startSec * fs));
  const endIndex = Math.min(
    lead.samples.length,
    Math.floor((startSec + durationSec) * fs)
  );
  if (startIndex >= endIndex) {
    logger.warn(
      `ECGPlot: startIndex >= endIndex (${startIndex} >= ${endIndex}) for lead ${lead.lead_name}`
    );
    return <div>Invalid ECG data range.</div>;
  }

  const visibleSamples = lead.samples.slice(startIndex, endIndex);

  const labels = visibleSamples.map((_, i) => (startIndex + i) / fs);

  return (
    <div
      style={{
        width: width ?? "100%",
        height: computedHeight,
        padding: 8,
        boxSizing: "border-box",
        userSelect: "none",
      }}
    >
      <Line
        data={{
          labels,
          datasets: [
            {
              label: "Voltage (mV)",
              data: visibleSamples,
              borderColor: "#000000",
              borderWidth: 1,
              pointRadius: 0,
              fill: false,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: "linear",
              min: startSec,
              max: startSec + durationSec,
              ticks: { stepSize: 0.04 },
              grid: { display: false },
            },
            y: {
              min: yMin,
              max: yMax,
              ticks: { stepSize: 0.1 },
              grid: { display: false },
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                title: (context) => `Time: ${context[0].parsed.x.toFixed(2)} s`,
                label: (context) =>
                  `Voltage: ${context.parsed.y.toFixed(2)} mV`,
              },
            },
          },
        }}
        plugins={[ecgGridPlugin]}
        width={width}
        height={computedHeight}
      />
    </div>
  );
};

// Responsive wrapper component
const ResponsiveECGPlot: React.FC<{ lead: Lead; fs: number }> = ({
  lead,
  fs,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(300);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          setContainerWidth(entry.contentRect.width);
        }
      });

      resizeObserver.observe(containerRef.current);
      setContainerWidth(containerRef.current.clientWidth);

      return () => resizeObserver.disconnect();
    } catch (error) {
      logger.error(
        "Error setting up ResizeObserver in ResponsiveECGPlot:",
        error
      );
    }
  }, []);

  const numSquaresHoriz = containerWidth / SMALL_SQUARE_PX;
  const durationSec = numSquaresHoriz * 0.04;
  const height = VERTICAL_SQUARES * SMALL_SQUARE_PX;

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        maxWidth: 600,
        height: height + 16,
        boxSizing: "border-box",
      }}
    >
      <ECGPlot
        lead={lead}
        fs={fs}
        durationSec={durationSec}
        width={containerWidth}
        height={height}
      />
    </div>
  );
};

interface LeadsPlotViewProps {
  data: CleanedLeadsResponse;
}

export default function LeadsPlotView({ data }: LeadsPlotViewProps) {
  const [modalLead, setModalLead] = useState<Lead | null>(null);
  const [, setModalStartSec] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Defensive check for data prop
  if (!data) {
    logger.warn("LeadsPlotView: No data provided");
    return <div className="p-4">Loading…</div>;
  }

  const { fs, leads } = data;

  // Validate fs and leads before rendering
  if (!fs || fs <= 0) {
    logger.error("LeadsPlotView: Invalid sampling frequency", fs);
    return <div className="p-4 text-red-600">Invalid sampling frequency.</div>;
  }
  if (!leads || leads.length === 0) {
    logger.warn("LeadsPlotView: No leads available");
    return <div className="p-4">No leads data available.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {leads.map((lead) => (
          <div
            key={lead.lead_name}
            className="bg-white shadow rounded p-2 cursor-pointer hover:ring ring-hearteye_orange"
            style={{ width: "100%", height: 180, boxSizing: "border-box" }}
            onClick={() => {
              setModalLead(lead);
              setModalStartSec(0);
              if (scrollRef.current) scrollRef.current.scrollLeft = 0;
            }}
          >
            <h2 className="text-sm font-medium mb-1">Lead {lead.lead_name}</h2>
            <ResponsiveECGPlot lead={lead} fs={fs} />
          </div>
        ))}
      </div>

      <Modal
        isOpen={!!modalLead}
        onRequestClose={() => setModalLead(null)}
        contentLabel="Detailed ECG View"
        className="relative bg-white rounded-lg shadow-lg w-full max-w-7xl h-auto max-h-[90vh] overflow-hidden outline-none p-6"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        ariaHideApp={false}
      >
        {modalLead && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Lead {modalLead.lead_name}
              </h2>
              <button
                onClick={() => setModalLead(null)}
                className="text-2xl text-gray-500 hover:text-black"
              >
                &times;
              </button>
            </div>

            {/* Scroll container */}
            <div
              style={{
                width: "100%",
                height: 420,
                overflowX: "auto",
                overflowY: "hidden",
                whiteSpace: "nowrap",
                userSelect: "none",
              }}
              ref={scrollRef}
            >
              {/* Wide canvas representing full ECG */}
              <div
                style={{
                  width: (modalLead.samples.length / fs) * 400, // 400 px per second
                  height: "100%",
                  display: "inline-block",
                }}
              >
                <Line
                  data={{
                    labels: modalLead.samples.map((_, i) => i / fs),
                    datasets: [
                      {
                        label: modalLead.lead_name,
                        data: modalLead.samples,
                        borderColor: "#000000",
                        borderWidth: 1,
                        pointRadius: 0,
                        fill: false,
                      },
                    ],
                  }}
                  options={{
                    responsive: false,
                    animation: false,
                    maintainAspectRatio: false,
                    scales: {
                      x: {
                        type: "linear",
                        min: 0,
                        max: modalLead.samples.length / fs,
                        ticks: {
                          stepSize: 0.1,
                          callback: (val: any) => Number(val).toFixed(1),
                        },
                        grid: { color: "transparent", drawTicks: false },
                      },
                      y: {
                        min: -1.2,
                        max: 1.2,
                        ticks: {
                          stepSize: 0.1,
                          callback: (val: any) => Number(val).toFixed(1),
                        },
                        grid: { color: "transparent", drawTicks: false },
                        title: { display: true, text: "mV" },
                      },
                    },
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          title: (context) =>
                            `Time: ${context[0].parsed.x.toFixed(2)} s`,
                          label: (context) =>
                            `Voltage: ${context.parsed.y.toFixed(2)} mV`,
                        },
                      },
                    },
                    elements: { line: { tension: 0 } },
                  }}
                  plugins={[ecgGridPlugin]}
                  height={400}
                  width={(modalLead.samples.length / fs) * 400}
                />
              </div>
            </div>

            {/* Fixed x-axis label */}
            <div className="text-center text-sm mt-2">Time (seconds)</div>
          </>
        )}
      </Modal>
    </div>
  );
}
