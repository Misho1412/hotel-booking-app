"use client";

import React, { FC } from "react";
import ReactDatePicker from "react-datepicker";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import "react-datepicker/dist/react-datepicker.css";

export interface DatePickerProps {
    className?: string;
    startDate: Date | null;
    endDate: Date | null;
    onChange: (dates: [Date | null, Date | null]) => void;
    numberOfMonths?: number;
    monthsShown?: number;
}

const DatePicker: FC<DatePickerProps> = ({
    className = "",
    startDate,
    endDate,
    onChange,
    numberOfMonths,
    monthsShown = 2,
}) => {
    const renderCustomHeader = ({
        monthDate,
        customHeaderCount,
        decreaseMonth,
        increaseMonth,
    }: any) => {
        const months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];

        return (
            <div className="flex items-center justify-between p-2.5">
                <button
                    onClick={decreaseMonth}
                    className="px-2 py-1 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                    <ChevronLeftIcon className="w-5 h-5 text-neutral-700 dark:text-neutral-200" />
                </button>
                <p className="text-neutral-700 dark:text-neutral-200 font-semibold text-base">
                    {months[monthDate.getMonth()]} {monthDate.getFullYear()}
                </p>
                <button
                    onClick={increaseMonth}
                    className="px-2 py-1 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                    <ChevronRightIcon className="w-5 h-5 text-neutral-700 dark:text-neutral-200" />
                </button>
            </div>
        );
    };

    return (
        <div
            className={`nc-DatePicker ${className}`}
            data-nc-id="DatePicker"
        >
            <ReactDatePicker
                selected={startDate}
                onChange={onChange}
                startDate={startDate}
                endDate={endDate}
                monthsShown={monthsShown}
                selectsRange
                inline
                renderCustomHeader={renderCustomHeader}
                calendarClassName="nc-calendar"
                dayClassName={() =>
                    "!h-12 !w-12 !text-sm !rounded-full !m-0.5 !transition !duration-200 flex items-center justify-center"
                }
            />
        </div>
    );
};

export default DatePicker; 