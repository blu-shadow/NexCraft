// ═══════════════════════════════════════════════════════════
//               MANAGE YOUTUBE CHANNEL PAGE
// ═══════════════════════════════════════════════════════════
import { useState, useEffect, useRef } from "react";
import { getChannelInfo, updateChannelInfo } from "../../services/youtubeService";
import { Toast, lbl, inp } from "./ManageVideos";

const UploadIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;

const ManageChannel = () => {
  const [channel, setChannel] = useState(null);
  const [form,    setForm   ] = useState({ channelName:"", channelUrl:"", channelHandle:"", description:"", subscriberCount:"", subscribeUrl:"" });
  const [logo,    setLogo   ] = useState(null);
  const [logoPrev,setLogoPrev]=useState(null);
  const [saving,  setSaving ] = useState(false);
  const [toast,   setToast  ] = useState(null);
  const logoRef = useRef();

  const showToast = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  useEffect(() => {
    getChannelInfo().then((r) => {
      if (r?.channel) {
        setChannel(r.channel);
        setForm({ channelName:r.channel.channelName||"", channelUrl:r.channel.channelUrl||"", channelHandle:r.channel.channelHandle||"", description:r.channel.description||"", subscriberCount:r.channel.subscriberCount||"", subscribeUrl:r.channel.subscribeUrl||"" });
        setLogoPrev(r.channel.channelLogo?.url||null);
      }
    }).catch(()=>{});
  }, []);

  const handleLogo = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setLogo(f);
    setLogoPrev(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.channelName) return showToast("Channel name is required","error");
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k,v));
      if (logo) fd.append("channelLogo", logo);
      await updateChannelInfo(fd);
      showToast("Channel info updated!");
    } catch (err) { showToast(err.response?.data?.message||"Failed","error"); }
    setSaving(false);
  };

  return (
    <div style={{ maxWidth:"700px" }}>
      {toast && <Toast toast={toast} />}

      <div style={{ background:"rgba(16,16,30,0.8)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"16px", padding:"28px" }}>
        <div style={{ marginBottom:"24px" }}>
          <h2 style={{ fontFamily:"var(--font-display)", fontSize:"17px", fontWeight:"800", color:"#e8e8f0", marginBottom:"6px" }}>YouTube Channel Settings</h2>
          <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.4)", fontFamily:"var(--font-body)" }}>This info appears at the top of the YouTube page.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"18px" }}>
          {/* Channel Logo */}
          <div>
            <label style={lbl}>Channel Logo</label>
            <div style={{ display:"flex", alignItems:"center", gap:"20px" }}>
              <div style={{ width:"80px", height:"80px", borderRadius:"50%", background:"linear-gradient(135deg,rgba(239,68,68,0.2),rgba(239,68,68,0.05))", border:"2px dashed rgba(239,68,68,0.3)", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", cursor:"pointer", flexShrink:0 }} onClick={()=>logoRef.current?.click()}>
                {logoPrev
                  ? <img src={logoPrev} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  : <span style={{ fontSize:"32px" }}>▶️</span>
                }
              </div>
              <div>
                <button type="button" onClick={()=>logoRef.current?.click()} style={{ display:"flex", alignItems:"center", gap:"6px", padding:"8px 16px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"10px", color:"rgba(255,255,255,0.6)", fontSize:"13px", cursor:"pointer", fontFamily:"var(--font-display)", fontWeight:"500" }}>
                  <UploadIcon /> Upload Logo
                </button>
                <p style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)", marginTop:"6px" }}>PNG, JPG — recommended 400×400px</p>
              </div>
              <input ref={logoRef} type="file" accept="image/*" onChange={handleLogo} style={{ display:"none" }} />
            </div>
          </div>

          {/* Channel Name */}
          <div>
            <label style={lbl}>Channel Name *</label>
            <input value={form.channelName} onChange={(e)=>setForm({...form,channelName:e.target.value})} placeholder="1000 Din" style={inp} required />
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
            <div>
              <label style={lbl}>Channel Handle</label>
              <input value={form.channelHandle} onChange={(e)=>setForm({...form,channelHandle:e.target.value})} placeholder="@1000din" style={inp} />
            </div>
            <div>
              <label style={lbl}>Subscriber Count</label>
              <input value={form.subscriberCount} onChange={(e)=>setForm({...form,subscriberCount:e.target.value})} placeholder="10K, 1.2M..." style={inp} />
            </div>
          </div>

          <div>
            <label style={lbl}>Channel URL</label>
            <input value={form.channelUrl} onChange={(e)=>setForm({...form,channelUrl:e.target.value})} placeholder="https://youtube.com/@1000din" style={inp} type="url" />
          </div>

          <div>
            <label style={lbl}>Subscribe Button URL</label>
            <input value={form.subscribeUrl} onChange={(e)=>setForm({...form,subscribeUrl:e.target.value})} placeholder="https://youtube.com/channel/subscribe" style={inp} type="url" />
            <p style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)", marginTop:"4px" }}>Users will be redirected here when they click Subscribe</p>
          </div>

          <div>
            <label style={lbl}>Channel Description</label>
            <textarea value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} placeholder="About this channel..." style={{ ...inp, minHeight:"80px", resize:"vertical" }} maxLength={500} />
          </div>

          {/* Preview Card */}
          <div style={{ background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.15)", borderRadius:"12px", padding:"16px 20px" }}>
            <p style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)", fontFamily:"var(--font-display)", fontWeight:"600", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:"12px" }}>Preview</p>
            <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
              <div style={{ width:"52px", height:"52px", borderRadius:"50%", background:"linear-gradient(135deg,rgba(239,68,68,0.3),rgba(239,68,68,0.1))", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", flexShrink:0 }}>
                {logoPrev ? <img src={logoPrev} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : <span style={{ fontSize:"24px" }}>▶️</span>}
              </div>
              <div>
                <p style={{ fontFamily:"var(--font-display)", fontWeight:"700", fontSize:"15px", color:"#e8e8f0" }}>{form.channelName || "Channel Name"}</p>
                <p style={{ fontSize:"12px", color:"rgba(255,255,255,0.4)", marginTop:"2px" }}>{form.channelHandle || "@handle"} {form.subscriberCount && `• ${form.subscriberCount} subscribers`}</p>
              </div>
              {form.subscribeUrl && (
                <div style={{ marginLeft:"auto", padding:"8px 18px", background:"#ef4444", borderRadius:"20px", color:"#fff", fontSize:"13px", fontFamily:"var(--font-display)", fontWeight:"700" }}>Subscribe</div>
              )}
            </div>
          </div>

          <button type="submit" disabled={saving} style={{ padding:"12px", background:"linear-gradient(135deg,#6c63ff,#4f46e5)", border:"none", borderRadius:"10px", color:"#fff", fontSize:"14px", fontFamily:"var(--font-display)", fontWeight:"700", cursor:saving?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", boxShadow:"0 4px 20px rgba(108,99,255,0.4)" }}>
            {saving && <span className="spinner spinner-sm" />}
            {saving ? "Saving..." : "Save Channel Settings"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ManageChannel;
