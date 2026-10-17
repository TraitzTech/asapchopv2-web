import { useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CardGiftcardOutlinedIcon from "@mui/icons-material/CardGiftcardOutlined";
import { useMutation, useQuery, useQueryClient } from "react-query";
import MainApi from "api-manage/MainApi";
import { gifts_received_api, gift_details_api } from "api-manage/ApiRoutes";
import { useTranslation } from "react-i18next";

const reactions = ["love", "grateful", "party", "yum", "hug"];

const GiftsInbox = () => {
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState(null);
  const [reaction, setReaction] = useState("love");
  const [message, setMessage] = useState("");
  const client = useQueryClient();
  const { data, isLoading, error } = useQuery(
    ["received-gifts"],
    async () => (await MainApi.get(`${gifts_received_api}?limit=50&offset=1`)).data
  );
  const { data: selectedGift, isLoading: detailLoading } = useQuery(
    ["gift-details", selectedId],
    async () => (await MainApi.get(`${gift_details_api}/${selectedId}`)).data,
    { enabled: Boolean(selectedId) }
  );
  const thankYou = useMutation(
    () => MainApi.post(`${gift_details_api}/${selectedId}/thank-you`, { reaction, message }),
    {
      onSuccess: async () => {
        await Promise.all([
          client.invalidateQueries(["gift-details", selectedId]),
          client.invalidateQueries(["received-gifts"]),
        ]);
      },
    }
  );

  if (isLoading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{t("Unable to load your gifts right now")}</Alert>;

  return (
    <Stack spacing={2}>
      {(data?.gifts || []).length === 0 ? (
        <Alert severity="info">{t("Gifts from friends will appear here.")}</Alert>
      ) : (data.gifts || []).map((gift) => (
        <Card key={gift.id} variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar src={gift.from_image_full_url || undefined}><CardGiftcardOutlinedIcon /></Avatar>
              <Box flex={1}>
                <Typography fontWeight={700}>{gift.from}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {gift.store_name} · {t(gift.card_theme?.replaceAll("_", " ") || "A gift for you")}
                </Typography>
              </Box>
              <Button variant="contained" onClick={() => setSelectedId(gift.id)}>
                {gift.opened_at ? t("View gift") : t("Open gift")}
              </Button>
            </Stack>
            {selectedId === gift.id && (
              <Box mt={2} pt={2} borderTop="1px solid" borderColor="divider">
                {detailLoading ? <CircularProgress size={22} /> : selectedGift && (
                  <Stack spacing={1.5}>
                    {selectedGift.message && (
                      <Typography sx={{ p: 2, borderRadius: 2, bgcolor: "action.hover", whiteSpace: "pre-wrap" }}>
                        “{selectedGift.message}”
                      </Typography>
                    )}
                    <Typography variant="subtitle2">{t("What’s inside")}</Typography>
                    {(selectedGift.order?.items || []).map((item, index) => (
                      <Typography key={`${item.name}-${index}`} variant="body2">
                        {item.quantity} × {item.name}{item.variation ? ` · ${item.variation}` : ""}
                      </Typography>
                    ))}
                    {selectedGift.thank_you ? (
                      <Alert severity="success">{t("You’ve already sent your thanks")}</Alert>
                    ) : (
                      <Stack spacing={1.5}>
                        <Typography fontWeight={600}>{t("Send a thank you")}</Typography>
                        <TextField select size="small" label={t("Reaction")} value={reaction} onChange={(event) => setReaction(event.target.value)}>
                          {reactions.map((item) => <MenuItem key={item} value={item}>{t(item)}</MenuItem>)}
                        </TextField>
                        <TextField multiline size="small" label={t("Message (optional)")} value={message} onChange={(event) => setMessage(event.target.value.slice(0, 150))} />
                        {thankYou.isError && <Alert severity="error">{t("Could not send your thank you. Please try again.")}</Alert>}
                        <Button variant="contained" onClick={() => thankYou.mutate()} disabled={thankYou.isLoading}>
                          {thankYou.isLoading ? t("Sending…") : t("Send thanks")}
                        </Button>
                      </Stack>
                    )}
                  </Stack>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
};

export default GiftsInbox;
