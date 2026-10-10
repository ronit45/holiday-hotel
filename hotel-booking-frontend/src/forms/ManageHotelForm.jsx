import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, Upload } from "lucide-react";
import { hotelFacilities } from "../utils/hotel-options-config";

const ManageHotelForm = ({ onSave, isLoading, hotel, onCancel, showBack }) => {
  const [formData, setFormData] = useState({
    name: "", city: "", country: "", description: "",
    pricePerNight: "", starRating: "", adultCount: "", childCount: "",
    facilities: [], imageUrls: [], imageFiles: [],
  });
  
  useEffect(() => { if (hotel) setFormData({ ...hotel, imageFiles: [] }); }, [hotel]);

  const onChange = (f, v) => setFormData(p => ({ ...p, [f]: v }));

  const onSubmit = (e) => {
    e.preventDefault();
    if (!formData.facilities.length) return alert("At least 1 facility required.");
    const imgCount = formData.imageUrls.length + formData.imageFiles.length;
    if (imgCount < 1 || imgCount > 6) return alert("Provide between 1 and 6 images.");

    const data = new FormData();
    if (hotel) data.append("hotelId", hotel._id);
    ["name", "city", "country", "description", "pricePerNight", "starRating", "adultCount", "childCount"].forEach(f => data.append(f, formData[f]));
    formData.facilities.forEach((f, i) => data.append(`facilities[${i}]`, f));
    formData.imageUrls.forEach((u, i) => data.append(`imageUrls[${i}]`, u));
    formData.imageFiles.forEach(f => data.append(`imageFiles`, f));
    onSave(data);
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <h1 className="text-2xl font-medium">Hotel Details</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label>Name<input required className="border p-2 w-full mt-1" value={formData.name} onChange={e => onChange("name", e.target.value)} /></label>
        <div className="flex gap-4">
          <label className="flex-1">City<input required className="border p-2 w-full mt-1" value={formData.city} onChange={e => onChange("city", e.target.value)} /></label>
          <label className="flex-1">Country<input required className="border p-2 w-full mt-1" value={formData.country} onChange={e => onChange("country", e.target.value)} /></label>
        </div>
        <label className="md:col-span-2">Description<textarea required rows={4} className="border p-2 w-full mt-1" value={formData.description} onChange={e => onChange("description", e.target.value)} /></label>
        <label>Price per Night (£)<input required type="number" min={1} className="border p-2 w-full mt-1" value={formData.pricePerNight} onChange={e => onChange("pricePerNight", e.target.value)} /></label>
        <label>Star Rating<select required className="border p-2 w-full mt-1 bg-white" value={formData.starRating} onChange={e => onChange("starRating", e.target.value)}><option value="">Select</option>{[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Stars</option>)}</select></label>
        <label>Adults<input required type="number" min={1} className="border p-2 w-full mt-1" value={formData.adultCount} onChange={e => onChange("adultCount", e.target.value)} /></label>
        <label>Children<input required type="number" min={0} className="border p-2 w-full mt-1" value={formData.childCount} onChange={e => onChange("childCount", e.target.value)} /></label>
      </div>

      <h2 className="text-xl font-medium mt-4">Facilities</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {hotelFacilities.map(f => (
          <label key={f} className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={formData.facilities.includes(f)} onChange={e => {
              onChange("facilities", e.target.checked ? [...formData.facilities, f] : formData.facilities.filter(x => x !== f));
            }} /> {f}
          </label>
        ))}
      </div>

      <ImagesSection formData={formData} onChange={onChange} />

      <div className="flex justify-end gap-3 mt-4">
        {showBack && <Link to="/my-hotels" className="px-4 py-2 border rounded-md hover:bg-gray-50">Back</Link>}
        {onCancel && <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-md hover:bg-gray-50">Cancel</button>}
        <button type="submit" disabled={isLoading} className="bg-blue-600 text-white px-6 py-2 rounded-md disabled:opacity-50">{isLoading ? "Saving..." : hotel ? "Update" : "Save"}</button>
      </div>
    </form>
  );
};

const ImagesSection = ({ formData, onChange }) => {
  const fileRef = useRef(null);
  
  const handleFileSelect = (e) => {
    if (!e.target.files) return;
    onChange("imageFiles", [...formData.imageFiles, ...Array.from(e.target.files)]);
  };

  const removeUrl = (url) => onChange("imageUrls", formData.imageUrls.filter(u => u !== url));
  const removeFile = (idx) => onChange("imageFiles", formData.imageFiles.filter((_, i) => i !== idx));

  return (
    <div>
      <h2 className="text-xl font-medium mt-4 mb-3">Images</h2>
      <div className="border border-dashed border-gray-300 p-6 text-center bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => fileRef.current?.click()}>
        <Upload className="w-8 h-8 mx-auto text-blue-500 mb-2" />
        <p className="text-gray-600">Click to select images (Max 6)</p>
        <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelect} />
      </div>
      
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-4">
        {formData.imageUrls.map((url) => (
          <div key={url} className="relative group">
            <img src={url} className="w-full h-24 object-cover rounded border" alt="Hotel" />
            <button type="button" onClick={() => removeUrl(url)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3"/></button>
          </div>
        ))}
        {formData.imageFiles.map((file, i) => (
          <div key={i} className="relative group">
            <img src={URL.createObjectURL(file)} className="w-full h-24 object-cover rounded border" alt="Upload Preview" />
            <button type="button" onClick={() => removeFile(i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3"/></button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageHotelForm;
