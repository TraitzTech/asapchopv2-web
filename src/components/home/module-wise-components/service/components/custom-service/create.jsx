import { useEffect, useMemo, useState } from "react";
import { Box, Button, Grid, MenuItem, Stack, TextField, Typography } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { useFormik } from "formik";
import moment from "moment";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import CustomContainer from "components/container";
import DeliveryAddress from "components/checkout/delivery-address";
import CustomTextFieldWithFormik from "components/form-fields/CustomTextFieldWithFormik";
import { CustomPaperBigCard, CustomStackFullWidth } from "styled-components/CustomStyles.style";
import {
  useCreateCustomServiceRequest,
  useServiceCategories,
  useUpdateCustomServiceRequest,
} from "../../service-api-manage/hooks/react-query/custom-service/useCustomServiceRequests";

const selectSx = { "& .MuiOutlinedInput-root": { borderRadius: "8px" } };

const to24Hour = (value) => {
  if (!value) return null;
  const parsed = moment(value, ["h:mm A", "HH:mm", "HH:mm:ss"]);
  return parsed.isValid() ? parsed.format("HH:mm") : null;
};

/**
 * Post (or edit) a custom service request: provider bids on it, the customer books an offer.
 * `editData` (from the edit page) switches the form to update mode.
 */
const CreateCustomService = ({ configData, editData }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const isEdit = Boolean(editData?.id);
  const [address, setAddress] = useState(
    editData?.lat
      ? {
          latitude: editData.lat,
          longitude: editData.lng,
          lat: editData.lat,
          lng: editData.lng,
          address: editData.address,
          address_type: editData.address_type || "Selected Address",
          contact_person_name: editData.contact_person_name,
          contact_person_number: editData.contact_person_number,
        }
      : undefined
  );

  const { mutate: createMutate, isLoading: isCreating } = useCreateCustomServiceRequest();
  const { mutate: updateMutate, isLoading: isUpdating } = useUpdateCustomServiceRequest();

  const formik = useFormik({
    initialValues: {
      category_id: editData?.category_id ?? "",
      sub_category_id: editData?.sub_category_id ?? "",
      description: editData?.description ?? "",
      booking_date: editData?.service_date ? moment(editData.service_date).format("YYYY-MM-DD") : "",
      booking_time: editData?.service_time ? to24Hour(editData.service_time) ?? "" : "",
      price: "",
    },
    validationSchema: Yup.object({
      category_id: Yup.string().required(t("Please select a category")),
      description: Yup.string().trim().required(t("Please describe what you need")),
      booking_date: Yup.string().required(t("Please choose a date")),
    }),
    onSubmit: (values) => {
      const latitude = address?.latitude ?? address?.lat;
      const longitude = address?.longitude ?? address?.lng;
      if (!latitude || !longitude) {
        toast.error(t("Please select the service address"));
        return;
      }
      const payload = {
        category_id: values.category_id,
        ...(values.sub_category_id ? { sub_category_id: values.sub_category_id } : {}),
        description: values.description.trim(),
        booking_date: values.booking_date,
        ...(values.booking_time ? { booking_time: values.booking_time } : {}),
        ...(values.price ? { price: Number(values.price) } : {}),
        address: {
          latitude,
          longitude,
          address: address?.address,
          address_type: address?.address_type,
          contact_person_name: address?.contact_person_name,
          contact_person_number: address?.contact_person_number,
        },
      };
      const onSuccess = (response) => {
        toast.success(response?.message ?? t("Request submitted successfully"));
        router.push({ pathname: "/profile", query: { page: "custom-service" } });
      };
      if (isEdit) updateMutate({ id: editData.id, ...payload }, { onSuccess });
      else createMutate(payload, { onSuccess });
    },
  });

  const { data: categories = [] } = useServiceCategories(null);
  const { data: subCategories = [] } = useServiceCategories(
    formik.values.category_id || null,
    Boolean(formik.values.category_id)
  );
  const hasSubCategories = useMemo(() => subCategories.length > 0, [subCategories]);

  // A different category invalidates the chosen sub category.
  useEffect(() => {
    if (formik.values.sub_category_id && !subCategories.some((item) => String(item.id) === String(formik.values.sub_category_id))) {
      formik.setFieldValue("sub_category_id", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subCategories]);

  return (
    <CustomContainer>
      <Grid container mb="2rem" paddingTop={{ xs: "1.5rem", md: "2.5rem" }}>
        <Grid item xs={12}>
          <Typography variant="h5" fontWeight="600">
            {isEdit ? t("Edit Custom Request") : t("Create Custom Request")}
          </Typography>
          <Typography sx={{ fontSize: "14px", color: "text.secondary", mt: 0.5 }}>
            {t("Describe the job and providers will send you their offers.")}
          </Typography>

          <CustomStackFullWidth marginTop={{ xs: "1.5rem", md: "2rem" }} alignItems="center">
            <CustomPaperBigCard sx={{ width: { xs: "100%", sm: "90%", md: "80%" }, padding: { xs: "1rem", md: "1.8rem" } }}>
              <form onSubmit={formik.handleSubmit} noValidate>
                <Stack spacing={2.5}>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <TextField
                      select
                      fullWidth
                      required
                      label={t("Category")}
                      value={formik.values.category_id}
                      onChange={(e) => formik.setFieldValue("category_id", e.target.value)}
                      error={Boolean(formik.touched.category_id && formik.errors.category_id)}
                      helperText={formik.touched.category_id && formik.errors.category_id}
                      sx={selectSx}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={String(category.id)}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </TextField>
                    {hasSubCategories && (
                      <TextField
                        select
                        fullWidth
                        label={t("Sub Category")}
                        value={formik.values.sub_category_id}
                        onChange={(e) => formik.setFieldValue("sub_category_id", e.target.value)}
                        sx={selectSx}
                      >
                        {subCategories.map((category) => (
                          <MenuItem key={category.id} value={String(category.id)}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  </Stack>

                  <CustomTextFieldWithFormik
                    label={t("Describe your request")}
                    required
                    multiline
                    rows={4}
                    touched={formik.touched.description}
                    errors={formik.errors.description}
                    fieldProps={formik.getFieldProps("description")}
                    onChangeHandler={(value) => formik.setFieldValue("description", value)}
                    value={formik.values.description}
                  />

                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <TextField
                      type="date"
                      fullWidth
                      required
                      label={t("Service date")}
                      value={formik.values.booking_date}
                      onChange={(e) => formik.setFieldValue("booking_date", e.target.value)}
                      error={Boolean(formik.touched.booking_date && formik.errors.booking_date)}
                      helperText={formik.touched.booking_date && formik.errors.booking_date}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: moment().format("YYYY-MM-DD") }}
                      sx={selectSx}
                    />
                    <TextField
                      type="time"
                      fullWidth
                      label={t("Service time")}
                      value={formik.values.booking_time}
                      onChange={(e) => formik.setFieldValue("booking_time", e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={selectSx}
                    />
                    <TextField
                      type="number"
                      fullWidth
                      label={t("Your budget (optional)")}
                      value={formik.values.price}
                      onChange={(e) => formik.setFieldValue("price", e.target.value)}
                      inputProps={{ min: 0 }}
                      sx={selectSx}
                    />
                  </Stack>

                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: "15px", mb: 1 }}>{t("Service Address")}</Typography>
                    <DeliveryAddress
                      setAddress={setAddress}
                      address={address}
                      configData={configData}
                      orderType="delivery"
                      formik={{ touched: {}, errors: {}, values: {}, getFieldProps: () => ({}) }}
                      passwordHandler={() => {}}
                      confirmPasswordHandler={() => {}}
                      check={false}
                      setCheck={() => {}}
                    />
                  </Box>

                  <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                    <Button
                      onClick={() => router.back()}
                      sx={{ px: 3, borderRadius: "10px", textTransform: "none", fontWeight: 600 }}
                    >
                      {t("Cancel")}
                    </Button>
                    <LoadingButton
                      type="submit"
                      variant="contained"
                      disableElevation
                      loading={isCreating || isUpdating}
                      sx={{ px: 4, py: 1.1, borderRadius: "10px", textTransform: "none", fontWeight: 600 }}
                    >
                      {isEdit ? t("Update Request") : t("Submit Request")}
                    </LoadingButton>
                  </Stack>
                </Stack>
              </form>
            </CustomPaperBigCard>
          </CustomStackFullWidth>
        </Grid>
      </Grid>
    </CustomContainer>
  );
};

export default CreateCustomService;
