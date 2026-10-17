import { useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CardGiftcardOutlinedIcon from "@mui/icons-material/CardGiftcardOutlined";
import { alpha, useTheme } from "@mui/material/styles";
import MainApi from "api-manage/MainApi";
import { gift_recipient_api } from "api-manage/ApiRoutes";
import { getToken } from "helper-functions/getToken";
import { useTranslation } from "react-i18next";

const themes = ["birthday", "thank_you", "just_because", "congrats", "get_well"];

const GiftOrderDetails = ({ value, onChange, disabled }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [phone, setPhone] = useState("");
  const [recipient, setRecipient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [enabled, setEnabled] = useState(false);

  const update = (patch) => onChange({ ...value, ...patch });
  const toggle = (checked) => {
    setEnabled(checked);
    setError("");
    if (!checked) {
      setRecipient(null);
      onChange(null);
    } else {
      onChange({ cardTheme: "just_because", message: "", anonymous: false });
    }
  };

  const findRecipient = async () => {
    if (!phone.trim()) {
      setError(t("Enter your recipient's phone number"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await MainApi.get(
        `${gift_recipient_api}?phone=${encodeURIComponent(phone.trim())}`
      );
      setRecipient(data);
      update({ recipientId: data.id });
    } catch (requestError) {
      setRecipient(null);
      update({ recipientId: null });
      setError(
        requestError?.response?.data?.errors?.[0]?.message ||
          t("No Asapchop customer has this number")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 2.5 },
        borderRadius: 2,
        border: `1px solid ${enabled ? alpha(theme.palette.primary.main, 0.42) : theme.palette.divider}`,
        bgcolor: enabled ? alpha(theme.palette.primary.main, 0.035) : "background.paper",
      }}
    >
      <FormControlLabel
        control={<Checkbox checked={enabled} onChange={(event) => toggle(event.target.checked)} disabled={disabled} />}
        label={
          <Stack direction="row" alignItems="center" spacing={1}>
            <CardGiftcardOutlinedIcon color="primary" />
            <Box>
              <Typography fontWeight={700}>{t("Send this order as a gift")}</Typography>
              <Typography variant="body2" color="text.secondary">
                {t("We’ll deliver it directly to another Asapchop customer.")}
              </Typography>
            </Box>
          </Stack>
        }
        sx={{ m: 0, alignItems: "flex-start" }}
      />
      {enabled && (
        <Stack spacing={2} mt={2}>
          {!getToken() && <Alert severity="info">{t("Sign in to send a gift")}</Alert>}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              fullWidth
              size="small"
              label={t("Recipient’s phone number")}
              value={phone}
              onChange={(event) => {
                const nextPhone = event.target.value;
                setPhone(nextPhone);
                if (recipient) {
                  setRecipient(null);
                  update({ recipientId: null });
                }
              }}
              onKeyDown={(event) => event.key === "Enter" && (event.preventDefault(), findRecipient())}
              disabled={!getToken() || disabled}
              inputProps={{ inputMode: "tel", maxLength: 20 }}
              helperText={t("Include the country calling code")}
            />
            <Button variant="outlined" onClick={findRecipient} disabled={!getToken() || disabled || loading} sx={{ minWidth: 120 }}>
              {loading ? <CircularProgress size={20} /> : t("Find customer")}
            </Button>
          </Stack>
          {error && <Alert severity="error">{error}</Alert>}
          {recipient && (
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar src={recipient.image_full_url || undefined}>{recipient.name?.[0]}</Avatar>
              <Typography fontWeight={600}>{recipient.name}</Typography>
            </Stack>
          )}
          <TextField
            select
            size="small"
            label={t("Gift card")}
            value={value?.cardTheme || "just_because"}
            onChange={(event) => update({ cardTheme: event.target.value })}
            disabled={disabled}
          >
            {themes.map((cardTheme) => (
              <MenuItem key={cardTheme} value={cardTheme}>
                {t(cardTheme.replaceAll("_", " "))}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            multiline
            minRows={2}
            maxRows={4}
            size="small"
            label={t("Gift message (optional)")}
            value={value?.message || ""}
            onChange={(event) => update({ message: event.target.value.slice(0, 150) })}
            helperText={`${value?.message?.length || 0}/150`}
            disabled={disabled}
          />
          <FormControlLabel
            control={<Checkbox checked={Boolean(value?.anonymous)} onChange={(event) => update({ anonymous: event.target.checked })} disabled={disabled} />}
            label={t("Send anonymously")}
            sx={{ m: 0 }}
          />
          <Alert severity="info">{t("Gift orders must be delivered and paid online or with your wallet. Cash on delivery isn’t available.")}</Alert>
        </Stack>
      )}
    </Box>
  );
};

export default GiftOrderDetails;
