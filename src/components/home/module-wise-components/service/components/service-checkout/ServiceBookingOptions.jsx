import {
  alpha,
  Box,
  Button,
  IconButton,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import moment from "moment";
import { useTranslation } from "react-i18next";

export const DATE_FORMAT = "YYYY-MM-DD HH:mm:ss";
const INPUT_FORMAT = "YYYY-MM-DDTHH:mm";

const toInput = (value) => (value ? moment(value, DATE_FORMAT).format(INPUT_FORMAT) : "");
const fromInput = (value) => (value ? moment(value, INPUT_FORMAT).format(DATE_FORMAT) : "");

// Dates of a daily / weekly series starting at `start`.
export const buildSeriesDates = (start, multiType, count) => {
  if (!start) return [];
  const step = multiType === "weekly" ? 7 : 1;
  return Array.from({ length: Math.max(count, 0) }, (_, index) =>
    moment(start, DATE_FORMAT).add(index * step, "days").format(DATE_FORMAT)
  );
};

const CardBox = ({ title, children }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: theme.palette.background.paper,
        borderRadius: { xs: "10px", md: "14px" },
        boxShadow: `0 1px 4px ${alpha("#000", 0.06)}`,
        px: { xs: 2, md: 3 },
        py: { xs: 1.5, md: 2 },
      }}
    >
      <Stack spacing={1.5}>
        <Typography sx={{ fontWeight: 700, fontSize: { xs: "14px", md: "16px" }, color: "text.primary" }}>
          {title}
        </Typography>
        {children}
      </Stack>
    </Box>
  );
};

const PillRow = ({ options, value, onSelect }) => {
  const theme = useTheme();
  return (
    <Stack direction="row" gap={{ xs: 0.5, md: 1 }} flexWrap="wrap">
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <Button
            key={option.value}
            onClick={() => onSelect(option.value)}
            variant={selected ? "contained" : "text"}
            disableElevation
            sx={{
              minWidth: { xs: 0, md: 140 },
              px: { xs: 1.5, md: 3 },
              py: { xs: 0.75, md: 1 },
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: selected ? 600 : 500,
              fontSize: { xs: "12px", md: "14px" },
              boxShadow: "none",
              backgroundColor: selected ? theme.palette.primary.main : "transparent",
              color: selected ? theme.palette.whiteContainer.main : theme.palette.neutral[700],
              "&:hover": {
                backgroundColor: selected
                  ? theme.palette.primary.dark
                  : alpha(theme.palette.primary.main, 0.08),
                boxShadow: "none",
              },
            }}
          >
            {option.label}
          </Button>
        );
      })}
    </Stack>
  );
};

const DateTimeField = ({ label, value, min, onChange }) => (
  <TextField
    type="datetime-local"
    size="small"
    label={label}
    value={toInput(value)}
    onChange={(e) => onChange(fromInput(e.target.value))}
    InputLabelProps={{ shrink: true }}
    inputProps={{ min: min ? moment(min).format(INPUT_FORMAT) : undefined }}
    sx={{ minWidth: { xs: "100%", sm: 260 }, "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
  />
);

/**
 * Where the service is given and when: customer place / provider place,
 * instant / scheduled / repeat (daily, weekly, custom dates).
 *
 * value: { getServiceAt, timing: "instant"|"schedule"|"repeat", scheduleAt,
 *          multiType: "daily"|"weekly"|"custom", repeatCount, dates }
 */
const ServiceBookingOptions = ({ provider, value, onChange, minLeadMinutes = 0, allowRepeat = true }) => {
  const { t } = useTranslation();
  const min = moment().add(minLeadMinutes, "minutes");

  const locations = provider?.choose_service_location ?? ["user"];
  const locationOptions = [
    locations.includes("user") && { value: "user", label: t("Provider comes to me") },
    locations.includes("provider") && { value: "provider", label: t("I'll visit the provider") },
  ].filter(Boolean);

  const timingOptions = [
    provider?.instant_booking && { value: "instant", label: t("Instant Booking") },
    provider?.schedule_booking && { value: "schedule", label: t("Schedule Booking") },
    allowRepeat && provider?.repeat_booking && { value: "repeat", label: t("Repeat Booking") },
  ].filter(Boolean);

  const setSeries = (patch) => {
    const next = { ...value, ...patch };
    onChange({
      ...patch,
      dates:
        next.multiType === "custom"
          ? next.dates
          : buildSeriesDates(next.scheduleAt, next.multiType, next.repeatCount),
    });
  };

  const customDates = value.dates?.length ? value.dates : [""];

  return (
    <>
      {locationOptions.length > 0 && (
        <CardBox title={t("Where do you need the service?")}>
          <PillRow
            options={locationOptions}
            value={value.getServiceAt}
            onSelect={(getServiceAt) => onChange({ getServiceAt })}
          />
          {value.getServiceAt === "provider" && provider?.address && (
            <Typography sx={{ fontSize: "13px", color: "text.secondary" }}>
              {t("Provider address")}: {provider.address}
            </Typography>
          )}
        </CardBox>
      )}

      {timingOptions.length > 0 && (
        <CardBox title={t("When do you need the service?")}>
          <PillRow
            options={timingOptions}
            value={value.timing}
            onSelect={(timing) => onChange({ timing, ...(timing === "repeat" ? { dates: buildSeriesDates(value.scheduleAt, value.multiType, value.repeatCount) } : {}) })}
          />

          {value.timing === "schedule" && (
            <DateTimeField
              label={t("Service date & time")}
              value={value.scheduleAt}
              min={min}
              onChange={(scheduleAt) => onChange({ scheduleAt })}
            />
          )}

          {value.timing === "repeat" && (
            <Stack spacing={1.5}>
              <PillRow
                options={[
                  { value: "daily", label: t("Daily") },
                  { value: "weekly", label: t("Weekly") },
                  { value: "custom", label: t("Custom") },
                ]}
                value={value.multiType}
                onSelect={(multiType) => setSeries({ multiType })}
              />

              {value.multiType !== "custom" ? (
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <DateTimeField
                    label={t("Start date & time")}
                    value={value.scheduleAt}
                    min={min}
                    onChange={(scheduleAt) => setSeries({ scheduleAt })}
                  />
                  <TextField
                    type="number"
                    size="small"
                    label={t("Number of bookings")}
                    value={value.repeatCount}
                    onChange={(e) =>
                      setSeries({ repeatCount: Math.min(Math.max(Number(e.target.value) || 2, 2), 30) })
                    }
                    inputProps={{ min: 2, max: 30 }}
                    sx={{ minWidth: { sm: 180 }, "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                  />
                </Stack>
              ) : (
                <Stack spacing={1}>
                  {customDates.map((date, index) => (
                    <Stack key={index} direction="row" spacing={1} alignItems="center">
                      <DateTimeField
                        label={`${t("Date")} ${index + 1}`}
                        value={date}
                        min={min}
                        onChange={(next) =>
                          onChange({ dates: customDates.map((item, i) => (i === index ? next : item)) })
                        }
                      />
                      {customDates.length > 1 && (
                        <IconButton
                          size="small"
                          onClick={() => onChange({ dates: customDates.filter((_, i) => i !== index) })}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                  ))}
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => onChange({ dates: [...customDates, ""] })}
                    sx={{ alignSelf: "flex-start", textTransform: "none", fontWeight: 600 }}
                  >
                    {t("Add another date")}
                  </Button>
                </Stack>
              )}

              {value.dates?.filter(Boolean).length > 0 && (
                <Typography sx={{ fontSize: "12px", color: "text.secondary" }}>
                  {value.dates.filter(Boolean).length} {t("bookings scheduled")}:{" "}
                  {value.dates
                    .filter(Boolean)
                    .map((date) => moment(date, DATE_FORMAT).format("DD MMM, hh:mm A"))
                    .join(" · ")}
                </Typography>
              )}
            </Stack>
          )}
        </CardBox>
      )}
    </>
  );
};

export default ServiceBookingOptions;
