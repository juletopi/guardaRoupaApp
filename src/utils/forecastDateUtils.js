import { getIconColor, mapApiIconToMCI } from "./weatherUtils";

export function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isSameDay(a, b) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

export function formatPtBrFullDate(date) {
    const formatter = new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const parts = formatter.formatToParts(date);

    const weekdayPart = parts.find((part) => part.type === "weekday");
    const dayPart = parts.find((part) => part.type === "day");
    const monthPart = parts.find((part) => part.type === "month");
    const yearPart = parts.find((part) => part.type === "year");

    let weekday = weekdayPart ? weekdayPart.value : "";
    const day = dayPart ? dayPart.value : "";
    let month = monthPart ? monthPart.value : "";
    const year = yearPart ? yearPart.value : "";

    weekday = weekday.replace("-feira", "");

    if (weekday) {
        weekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    }

    if (month) {
        month = month.charAt(0).toUpperCase() + month.slice(1);
    }

    return `${weekday}, ${day} de ${month} de ${year}`;
}

export function formatDateInput(date) {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
}

export function parseDateInput(inputValue) {
    const trimmedValue = inputValue.trim();
    const match = trimmedValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

    if (!match) return null;

    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    const parsedDate = new Date(year, month - 1, day);

    if (
        parsedDate.getFullYear() !== year ||
        parsedDate.getMonth() !== month - 1 ||
        parsedDate.getDate() !== day
    ) {
        return null;
    }

    return parsedDate;
}

export function getForecastItemsForDate(forecastList, targetDate) {
    const targetDateStr = startOfDay(targetDate).toDateString();

    return forecastList
        .filter(
            (item) => new Date(item.dt * 1000).toDateString() === targetDateStr,
        )
        .map((item, index) => ({
            id: `${item.dt}-${index}`,
            time: new Date(item.dt * 1000).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
            }),
            icon: mapApiIconToMCI(item.weather[0].icon),
            precipitation: `${Math.round((item.pop ?? 0) * 100)}%`,
            iconColor: getIconColor(item.weather[0].icon),
        }));
}

export function buildMonthGrid(viewDate) {
    const firstDayOfMonth = new Date(
        viewDate.getFullYear(),
        viewDate.getMonth(),
        1,
    );
    const lastDayOfMonth = new Date(
        viewDate.getFullYear(),
        viewDate.getMonth() + 1,
        0,
    );
    const startWeekday = firstDayOfMonth.getDay();

    const leadingDays = startWeekday === 0 ? 6 : startWeekday - 1;
    const totalCells =
        Math.ceil((leadingDays + lastDayOfMonth.getDate()) / 7) * 7;

    const days = Array.from({ length: totalCells }, (_, index) => {
        const dayOffset = index - leadingDays;
        const date = new Date(
            viewDate.getFullYear(),
            viewDate.getMonth(),
            dayOffset + 1,
        );

        return {
            key: `${date.toISOString()}-${index}`,
            date,
            isCurrentMonth: date.getMonth() === viewDate.getMonth(),
        };
    });

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7));
    }

    return weeks;
}
