import { yupResolver } from "@hookform/resolvers/yup";
import React, { DragEvent, useEffect, useRef, useState } from "react";
import { Resolver, useForm } from "react-hook-form";
import * as yup from "yup";

interface UploadData {
  file: File;
  patientName: string;
  age: number;
  gender: string;
}

interface FileUploadProps {
  onUpload: (data: UploadData) => void;
  uploading: boolean;
  uploadError?: string | null;
  uploadSuccess?: string | null;
}

interface FormValues {
  patientName: string;
  age: number | ""; // can be empty string for input state
  gender: string;
}

// Yup schema for validation, age nullable but required
const schema = yup.object({
  patientName: yup
    .string()
    .required("Patient name is required")
    .max(50, "Patient name must be at most 50 characters"),
  age: yup
    .number()
    .typeError("Age must be a number")
    .required("Age is required")
    .min(0, "Age must be at least 0")
    .max(105, "Age must be at most 105"),
  gender: yup
    .string()
    .required("Gender is required")
    .oneOf(["M", "F", "O"], "Invalid gender selection"),
});

export default function FileUpload({
  onUpload,
  uploading,
  uploadError,
  uploadSuccess,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    mode: "onChange",
    resolver: yupResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      patientName: "",
      age: "",
      gender: "",
    },
  });

  useEffect(() => {
    if (uploadSuccess) {
      setFile(null);
      reset();
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [uploadSuccess, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    setFile(selectedFile);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const onSubmit = (data: FormValues) => {
    if (file) {
      // convert age from string | number to number only
      onUpload({
        file,
        patientName: data.patientName,
        age: Number(data.age),
        gender: data.gender,
      });
    }
  };

  return (
    <div>
      {/* File upload box */}
      <div
        className={`border-2 border-dashed p-8 text-center cursor-pointer rounded mb-4 ${
          uploadError ? "border-red-400" : "border-gray-300"
        } hover:bg-gray-50`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        aria-label="Upload ECG ZIP file"
      >
        <p className="text-gray-500">
          {file
            ? `Selected file: ${file.name}`
            : "Drag & drop ECG ZIP, or click to select."}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".zip"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
          aria-label="Select ECG ZIP file"
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Patient Name */}
        <div className="mb-4">
          <input
            {...register("patientName")}
            type="text"
            placeholder="Patient Name"
            maxLength={50}
            disabled={uploading}
            className={`w-full border rounded px-3 py-2 ${
              errors.patientName ? "border-red-500" : ""
            }`}
            aria-invalid={!!errors.patientName}
            aria-describedby="patientName-error"
          />
          {errors.patientName && (
            <p className="text-red-600 text-sm mt-1" id="patientName-error">
              {errors.patientName.message}
            </p>
          )}
        </div>

        {/* Age */}
        <div className="mb-4">
          <input
            {...register("age")}
            type="number"
            placeholder="Age"
            min={0}
            max={105}
            disabled={uploading}
            className={`w-full border rounded px-3 py-2 ${
              errors.age ? "border-red-500" : ""
            }`}
            aria-invalid={!!errors.age}
            aria-describedby="age-error"
          />
          {errors.age && (
            <p className="text-red-600 text-sm mt-1" id="age-error">
              {errors.age.message}
            </p>
          )}
        </div>

        {/* Gender */}
        <div className="mb-4">
          <select
            {...register("gender")}
            disabled={uploading}
            className={`w-full border rounded px-3 py-2 ${
              errors.gender ? "border-red-500" : ""
            }`}
            aria-invalid={!!errors.gender}
            aria-describedby="gender-error"
          >
            <option value="">Select Gender</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="O">Other</option>
          </select>
          {errors.gender && (
            <p className="text-red-600 text-sm mt-1" id="gender-error">
              {errors.gender.message}
            </p>
          )}
        </div>

        {/* Messages container */}
        <div className="mt-4 mb-3 min-h-[1rem] flex items-center justify-center">
          {uploadSuccess && (
            <p className="text-green-600 text-sm font-medium">
              {uploadSuccess}
            </p>
          )}
          {uploadError && (
            <p className="text-red-600 text-sm font-medium">{uploadError}</p>
          )}
        </div>

        {/* Upload button */}
        <button
          type="submit"
          disabled={uploading || !file || !isValid}
          className="w-full bg-hearteye_orange hover:bg-yellow-500 text-white font-semibold py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
}
