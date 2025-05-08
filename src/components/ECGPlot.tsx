import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PeakSets { 
  P: number[]; 
  Q: number[]; 
  R: number[]; 
  S: number[]; 
  T: number[]; 
}

interface LeadData {
  name: string;
  signal: number[];
  peaks: PeakSets;
  title?: string;
}

interface ECGPlotProps {
  ecgData: LeadData;
}

export default function ECGPlot({ ecgData }: ECGPlotProps) {
  const { signal, peaks, title } = ecgData;
  const labels = signal.map((_, i) => i);

  // Create arrays for each peak type, with null for non-peak points
  const createPeakArray = (peakIndices: number[]) => {
    const arr = new Array(signal.length).fill(null);
    peakIndices.forEach(i => arr[i] = signal[i]);
    return arr;
  };

  const data: ChartData<'line'> = {
    labels,
    datasets: [
      { 
        label: 'Signal', 
        data: signal, 
        borderColor: 'blue', 
        fill: false 
      },
      {
        label: 'P Peaks',
        data: createPeakArray(peaks.P),
        borderColor: 'red',
        pointBackgroundColor: 'red',
        pointRadius: 5,
        showLine: false
      },
      {
        label: 'Q Peaks',
        data: createPeakArray(peaks.Q),
        borderColor: 'purple',
        pointBackgroundColor: 'purple',
        pointRadius: 5,
        showLine: false
      },
      {
        label: 'R Peaks',
        data: createPeakArray(peaks.R),
        borderColor: 'black',
        pointBackgroundColor: 'black',
        pointRadius: 5,
        showLine: false
      },
      {
        label: 'S Peaks',
        data: createPeakArray(peaks.S),
        borderColor: 'blue',
        pointBackgroundColor: 'blue',
        pointRadius: 5,
        showLine: false
      },
      {
        label: 'T Peaks',
        data: createPeakArray(peaks.T),
        borderColor: 'green',
        pointBackgroundColor: 'green',
        pointRadius: 5,
        showLine: false
      }
    ]
  };

  const options: ChartOptions<'line'> = {
    plugins: { 
      title: { 
        display: !!title, 
        text: title || '' 
      } 
    },
    scales: {
      x: { 
        title: { 
          display: true, 
          text: 'Sample' 
        } 
      },
      y: { 
        title: { 
          display: true, 
          text: 'Amplitude' 
        } 
      }
    }
  };

  return <Line data={data} options={options} />;
}
