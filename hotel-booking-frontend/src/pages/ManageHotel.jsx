import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ManageHotelForm from "../forms/ManageHotelForm";
import { useAppContext } from "../contexts/AppContext";
import * as apiClient from "../api-client";

const ManageHotel = () => {
  const { hotelId } = useParams();
  const { showToast, showGlobalLoading, hideGlobalLoading } = useAppContext();
  const navigate = useNavigate();
  
  const [hotel, setHotel] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!hotelId;

  useEffect(() => {
    if (isEditMode) {
      const fetchHotel = async () => {
        showGlobalLoading("Loading hotel data...");
        try {
          const data = await apiClient.fetchMyHotelById(hotelId);
          setHotel(data);
        } catch (err) {
          console.error("Failed to fetch hotel", err);
        } finally {
          hideGlobalLoading();
        }
      };
      fetchHotel();
    }
  }, [hotelId, isEditMode]);

  const handleSave = async (hotelFormData) => {
    setIsLoading(true);
    try {
      if (isEditMode) {
        await apiClient.updateMyHotelById(hotelFormData);
      } else {
        await apiClient.addMyHotel(hotelFormData);
      }
      showToast({
        title: isEditMode ? "Hotel Updated Successfully" : "Hotel Added Successfully",
        description: isEditMode
          ? "Your hotel details have been updated successfully! Redirecting to My Hotels..."
          : "Your hotel has been added to the platform successfully! Redirecting to My Hotels...",
        type: "SUCCESS",
      });
      setTimeout(() => {
        navigate("/my-hotels");
      }, 1500);
    } catch (err) {
      showToast({
        title: isEditMode ? "Failed to Update Hotel" : "Failed to Add Hotel",
        description: isEditMode
          ? "There was an error updating your hotel. Please try again."
          : "There was an error saving your hotel. Please try again.",
        type: "ERROR",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/my-hotels");
  };

  return (
    <ManageHotelForm
      hotel={hotel}
      onSave={handleSave}
      isLoading={isLoading}
      onCancel={isEditMode ? handleCancel : undefined}
      showBack
    />
  );
};

export default ManageHotel;
