import React, { useState, useRef, useEffect } from 'react';
import { 
  EnvelopeIcon, 
  PaperClipIcon, 
  PaperAirplaneIcon, 
  CheckIcon, 
  XMarkIcon, 
  GlobeIcon,
  DocumentDuplicateIcon,
  EllipsisHorizontalIcon,
  ArrowTopRightOnSquareIcon
} from './Icons';
import { getAssetUrl } from '../App';

interface ContactViewProps {
  onNavigateTab: (tab: 'home' | 'dining' | 'travel' | 'story' | 'about' | 'contact') => void;
}

const CATEGORIES = [
  '餐廳推薦',
  '體驗心得',
  '資訊勘誤',
  '合作洽談',
  '其他建議'
];

export const ContactView: React.FC<ContactViewProps> = ({ onNavigateTab }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingStep, setSubmittingStep] = useState<string>('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Email Action Sheet (Bottom Sheet on Mobile, Centered Modal on Desktop)
  const [showEmailActionSheet, setShowEmailActionSheet] = useState(false);
  const [isCopiedEmail, setIsCopiedEmail] = useState(false);
  const [isCopiedContent, setIsCopiedContent] = useState(false);

  const [submittedData, setSubmittedData] = useState<{
    name: string;
    email: string;
    category: string;
    message: string;
    fileName?: string;
    fileUrl?: string;
    time: string;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close Action Sheet on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showEmailActionSheet) {
        setShowEmailActionSheet(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showEmailActionSheet]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 15MB
    if (file.size > 15 * 1024 * 1024) {
      setValidationError('上傳檔案大小需小於 15MB，請更換較小的檔案');
      return;
    }

    setSelectedFile(file);

    // Create thumbnail if it is an image
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFilePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('willy2005109@gmail.com');
    setIsCopiedEmail(true);
    setTimeout(() => {
      setIsCopiedEmail(false);
      setShowEmailActionSheet(false);
    }, 1200);
  };

  const handleOpenMailApp = () => {
    window.location.href = 'mailto:willy2005109@gmail.com?subject=[LIWEI%20GUIDE]%20訪客來信';
    setShowEmailActionSheet(false);
  };

  const handleOpenGmailWeb = () => {
    window.open('https://mail.google.com/mail/?view=cm&fs=1&to=willy2005109@gmail.com&su=[LIWEI%20GUIDE]%20訪客來信', '_blank');
    setShowEmailActionSheet(false);
  };

  const handleCopyContent = () => {
    const fullText = `【寄件人】${name}\n【電子信箱】${email}\n【主旨分類】${category}\n【訊息內容】\n${message}${selectedFile ? `\n【附件檔案】${selectedFile.name}` : ''}`;
    navigator.clipboard.writeText(fullText);
    setIsCopiedContent(true);
    setTimeout(() => setIsCopiedContent(false), 2000);
  };

  const getMailtoUrl = () => {
    const subject = encodeURIComponent(`[LIWEI GUIDE 訪客回饋] 【${category}】${name || '訪客'}`);
    const body = encodeURIComponent(`寄件人：${name || '未提供'}\n聯絡信箱：${email || '未提供'}\n分類：${category}\n\n回饋內容：\n${message}\n\n${selectedFile ? `[提示] 寄件人原本選擇之附件：${selectedFile.name}，可手動將檔案附加於此信件中。` : ''}`);
    return `mailto:willy2005109@gmail.com?subject=${subject}&body=${body}`;
  };

  const getGmailWebUrl = () => {
    const subject = encodeURIComponent(`[LIWEI GUIDE 訪客回饋] 【${category}】${name || '訪客'}`);
    const body = encodeURIComponent(`寄件人：${name || '未提供'}\n聯絡信箱：${email || '未提供'}\n分類：${category}\n\n回饋內容：\n${message}\n\n${selectedFile ? `[提示] 寄件人原本選擇之附件：${selectedFile.name}，可手動將檔案附加於此信件中。` : ''}`);
    return `https://mail.google.com/mail/?view=cm&fs=1&to=willy2005109@gmail.com&su=${subject}&body=${body}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName) {
      setValidationError('請填寫您的姓名或稱呼');
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setValidationError('請填寫有效的電子信箱格式，以便主編能順利回覆您');
      return;
    }

    if (!trimmedMessage) {
      setValidationError('請輸入回饋或意見內容');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    let uploadedFileUrl = '';

    // Step 1: Upload attachment if present
    if (selectedFile) {
      setSubmittingStep('正在上傳附件檔案...');
      try {
        const fileData = new FormData();
        fileData.append('file', selectedFile);

        const uploadController = new AbortController();
        const uploadTimeout = setTimeout(() => uploadController.abort(), 12000);

        const uploadRes = await fetch('https://tmpfiles.org/api/v1/upload', {
          method: 'POST',
          body: fileData,
          signal: uploadController.signal,
        });

        clearTimeout(uploadTimeout);

        if (uploadRes.ok) {
          const uploadJson = await uploadRes.json();
          if (uploadJson && uploadJson.data && uploadJson.data.url) {
            uploadedFileUrl = uploadJson.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
          }
        }
      } catch (uploadErr) {
        console.warn('File upload skipped or timed out, proceeding with email body notification:', uploadErr);
      }
    }

    // Step 2: Send email through reliable endpoint
    setSubmittingStep('正在寄送回饋至主編信箱...');

    let isSuccess = false;

    try {
      const payload: Record<string, string> = {
        name: trimmedName,
        email: trimmedEmail,
        category,
        message: trimmedMessage,
      };

      if (selectedFile) {
        payload.attachment_name = selectedFile.name;
        payload.attachment_size = `${(selectedFile.size / 1024).toFixed(1)} KB`;
        if (uploadedFileUrl) {
          payload.attachment_download_url = uploadedFileUrl;
        } else {
          payload.attachment_note = '訪客已選擇本機檔案，若需原檔可直接回信向訪客索取';
        }
      }

      const res = await fetch('https://shipmyform.com/to/willy2005109@gmail.com', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok || res.status === 200 || res.status === 302) {
        isSuccess = true;
      } else {
        console.warn('Form endpoint responded with non-200 status:', res.status);
      }
    } catch (err) {
      console.warn('Form submission encountered network error:', err);
    }

    const record = {
      name: trimmedName,
      email: trimmedEmail,
      category,
      message: trimmedMessage,
      fileName: selectedFile?.name,
      fileUrl: uploadedFileUrl || undefined,
      time: new Date().toLocaleString('zh-TW', { hour12: false }),
    };

    setSubmittedData(record);

    try {
      const existing = JSON.parse(localStorage.getItem('liwei_sent_feedbacks') || '[]');
      existing.unshift(record);
      localStorage.setItem('liwei_sent_feedbacks', JSON.stringify(existing.slice(0, 10)));
    } catch (_) {}

    setIsSubmitting(false);
    setSubmittingStep('');

    if (isSuccess) {
      setSubmitStatus('success');
    } else {
      setSubmitStatus('error');
    }
  };

  const handleResetForm = () => {
    setName('');
    setEmail('');
    setCategory(CATEGORIES[0]);
    setMessage('');
    setSelectedFile(null);
    setFilePreview(null);
    setSubmitStatus('idle');
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="animate-fade-in-up flex flex-col min-h-full">
      {/* Banner Header */}
      <div className="relative w-full h-48 md:h-64 lg:h-80 bg-stone-900 overflow-hidden shrink-0">
        <img
          src={getAssetUrl('/images/lg/coming_soon.png')}
          onError={(e) => {
            (e.target as HTMLImageElement).src = getAssetUrl('/images/lg/coming_soon.png');
          }}
          alt="Contact Cover"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none"></div>
        <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 text-white">
          <div className="flex items-center gap-2 mb-2 text-[#C5A059]">
            <EnvelopeIcon className="w-5 h-5" />
            <span className="text-xs md:text-sm tracking-[0.25em] uppercase font-sans font-semibold">Contact & Feedback</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-serif tracking-widest text-shadow">聯繫</h2>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-10 w-full mb-12">
        {/* Intro notice banner - with rounded corners */}
        <div className="bg-white border border-stone-200 p-6 md:p-8 mb-8 shadow-sm rounded-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-5 mb-5">
            <div>
              <span className="text-xs font-bold text-[#C5A059] uppercase tracking-widest font-sans block mb-1">Direct to Editor</span>
              <h3 className="text-xl md:text-2xl font-bold text-[#000053] font-serif">寫信給主編</h3>
            </div>
            
            {/* Email Badge with Action Icon Button */}
            <div className="inline-flex items-center gap-2 bg-[#000053]/5 pl-3.5 pr-2 py-1.5 border border-[#000053]/15 rounded-full text-xs font-sans text-[#000053] shadow-sm self-start md:self-auto">
              <EnvelopeIcon className="w-4 h-4 text-[#C5A059] shrink-0" />
              <span className="font-mono select-all font-medium">willy2005109@gmail.com</span>
              <button
                type="button"
                onClick={() => setShowEmailActionSheet(true)}
                className="p-1 hover:bg-[#000053]/10 text-stone-500 hover:text-[#000053] rounded-full transition-all active:scale-90 cursor-pointer ml-1"
                title="信箱選項（複製或開啟郵件應用）"
                aria-label="信箱選項"
              >
                <EllipsisHorizontalIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-stone-600 text-sm md:text-base leading-relaxed font-sans">
            歡迎您分享私房愛店、用餐心得、行程想法，或是針對指南內容提供指正與回饋。
            只需留下您的姓名與信箱，便能直接填寫意見並附帶照片或文件，信件將自動傳送至主編專屬信箱。
          </p>
        </div>

        {/* Main Content State */}
        {submitStatus === 'success' ? (
          <div className="bg-white border-2 border-[#000053] p-8 md:p-12 text-center rounded-2xl shadow-sm animate-fade-in-up">
            <div className="w-16 h-16 bg-[#000053] text-white flex items-center justify-center mx-auto mb-6 rounded-full">
              <CheckIcon className="w-8 h-8 text-[#C5A059]" />
            </div>
            <h3 className="text-2xl font-bold text-[#000053] font-serif mb-3">回饋已成功送出！</h3>
            <p className="text-stone-600 font-sans max-w-lg mx-auto text-sm md:text-base leading-relaxed mb-6">
              非常感謝您的熱心回饋與支持！您的訊息與附件資訊已直接寄送至主編信箱（<span className="font-mono text-[#000053] font-medium">willy2005109@gmail.com</span>）。
              主編收到後，若有需要將會透過您填寫的信箱（<span className="font-mono text-[#000053] font-medium">{submittedData?.email}</span>）儘速與您聯絡。
            </p>

            {/* Submission preview box */}
            {submittedData && (
              <div className="bg-stone-50 border border-stone-200 p-4 text-left max-w-lg mx-auto mb-8 rounded-xl text-xs font-sans space-y-2">
                <div className="flex justify-between border-b border-stone-200 pb-2">
                  <span className="text-stone-500">送出時間</span>
                  <span className="font-mono text-stone-700">{submittedData.time}</span>
                </div>
                <div className="flex justify-between border-b border-stone-200 pb-2">
                  <span className="text-stone-500">寄件人</span>
                  <span className="font-bold text-stone-800">{submittedData.name} ({submittedData.email})</span>
                </div>
                <div className="flex justify-between border-b border-stone-200 pb-2">
                  <span className="text-stone-500">意見類別</span>
                  <span className="text-[#000053] font-bold">{submittedData.category}</span>
                </div>
                {submittedData.fileName && (
                  <div className="flex justify-between border-b border-stone-200 pb-2">
                    <span className="text-stone-500">附件檔案</span>
                    <span className="font-mono text-stone-700">{submittedData.fileName}</span>
                  </div>
                )}
                <div>
                  <span className="text-stone-500 block mb-1">內容摘要：</span>
                  <p className="text-stone-700 bg-white p-2.5 border border-stone-200 rounded-lg leading-relaxed line-clamp-3">
                    {submittedData.message}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={handleResetForm}
                className="px-6 py-2.5 bg-[#000053] text-white hover:bg-stone-800 transition-colors text-sm font-sans font-bold rounded-full cursor-pointer active:scale-95 shadow-md"
              >
                再寫一則回饋
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('home')}
                className="px-6 py-2.5 border border-stone-300 text-stone-700 hover:border-[#000053] hover:text-[#000053] transition-colors text-sm font-sans font-medium rounded-full cursor-pointer active:scale-95"
              >
                返回指南首頁
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-stone-200 p-6 md:p-10 shadow-sm rounded-2xl space-y-6">
            {/* Validation Notice Banner */}
            {validationError && (
              <div className="bg-red-50 border border-red-300 p-4 rounded-xl text-xs text-red-700 font-sans flex items-center justify-between gap-2">
                <span>{validationError}</span>
                <button
                  type="button"
                  onClick={() => setValidationError(null)}
                  className="text-red-500 hover:text-red-800 p-1 rounded-full cursor-pointer"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Error or Fallback Notice */}
            {submitStatus === 'error' && (
              <div className="bg-amber-50 border border-amber-300 p-5 rounded-xl text-sm text-stone-800 font-sans space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold">
                  <EnvelopeIcon className="w-5 h-5 text-amber-600" />
                  <span>線上直接傳送受限，可一鍵開啟郵件應用程式發送</span>
                </div>
                <p className="text-stone-600 text-xs leading-relaxed">
                  因瀏覽器安全性防護或網路設定，線上表單伺服器未能直接完成回應。
                  內容已為您妥善保留，您可以直接點擊下方任一按鈕，將預先填妥的內容發送至 <strong className="text-[#000053]">willy2005109@gmail.com</strong>：
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href={getGmailWebUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#000053] text-white text-xs font-bold rounded-full hover:bg-stone-800 transition-all active:scale-95"
                  >
                    <GlobeIcon className="w-4 h-4 text-[#C5A059]" />
                    以 Gmail 網頁版開啟
                  </a>
                  <a
                    href={getMailtoUrl()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#000053] text-[#000053] text-xs font-bold rounded-full hover:bg-[#000053]/5 transition-all active:scale-95"
                  >
                    <PaperAirplaneIcon className="w-4 h-4 text-[#C5A059]" />
                    以本機預設郵件軟體開啟 (mailto)
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyContent}
                    className="inline-flex items-center gap-1 px-4 py-2 border border-stone-300 text-stone-700 text-xs font-medium rounded-full hover:bg-stone-100 transition-all active:scale-95 cursor-pointer"
                  >
                    {isCopiedContent ? '已複製填寫內容！' : '複製我填寫的文字'}
                  </button>
                </div>
              </div>
            )}

            {/* Sender Name & Email Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 font-sans">
                  您的姓名 / 稱呼 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如：林先生、陳小姐"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-sm font-sans focus:bg-white focus:border-[#000053] focus:outline-none transition-colors shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 font-sans">
                  您的聯絡電子信箱 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="例如：yourname@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-sm font-sans focus:bg-white focus:border-[#000053] focus:outline-none transition-colors shadow-inner"
                />
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 font-sans">
                意見主旨類別
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-2 text-xs font-sans transition-all rounded-full cursor-pointer ${
                        isSelected
                          ? 'bg-[#000053] text-white font-bold shadow-md'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 font-sans">
                回饋或意見內容 <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={6}
                placeholder="請輸入您的具體建議、推薦餐廳名稱、地址、推薦原因，或任何您想告訴主編的話..."
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-sm font-sans focus:bg-white focus:border-[#000053] focus:outline-none transition-colors leading-relaxed shadow-inner"
              />
              <div className="flex justify-end items-center text-[11px] text-stone-400 mt-1 font-sans">
                <span>{message.length} 字</span>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="border-t border-stone-200 pt-6">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 font-sans">
                上傳相關檔案或照片 <span className="text-stone-400 font-normal">(選填，單檔上限 15MB)</span>
              </label>

              <input
                ref={fileInputRef}
                type="file"
                id="contact-file-upload"
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
              />

              {!selectedFile ? (
                <label
                  htmlFor="contact-file-upload"
                  className="border-2 border-dashed border-stone-300 hover:border-[#000053] p-6 text-center block cursor-pointer transition-colors rounded-2xl bg-stone-50/50 hover:bg-stone-50"
                >
                  <PaperClipIcon className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-stone-700 font-sans">點擊此處選擇檔案或將檔案拖曳至此</p>
                  <p className="text-xs text-stone-400 mt-1 font-sans">支援圖片 (JPG, PNG, WebP) 以及 PDF、文件等</p>
                </label>
              ) : (
                <div className="bg-stone-50 border border-stone-300 p-4 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {filePreview ? (
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="w-14 h-14 object-cover rounded-lg border border-stone-200 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-[#000053]/10 text-[#000053] flex items-center justify-center rounded-lg shrink-0 font-bold text-xs uppercase">
                        FILE
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-stone-800 truncate font-sans">{selectedFile.name}</p>
                      <p className="text-xs text-stone-400 font-mono">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · {selectedFile.type || '檔案'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors shrink-0 cursor-pointer"
                    title="移除檔案"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Submit Action */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-200">
              <div className="text-xs text-stone-400 font-sans">
                {submittingStep && (
                  <span className="text-[#000053] font-medium animate-pulse">{submittingStep}</span>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#000053] hover:bg-stone-800 text-white font-sans font-bold text-sm tracking-widest rounded-full shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                    <span>傳送中...</span>
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="w-4 h-4 text-[#C5A059]" />
                    <span>確認送出回饋</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Bottom Navigation Links */}
        <div className="pt-12 mt-12 border-t border-stone-200 text-center">
          <h3 className="text-lg font-bold text-stone-700 mb-6 font-serif">LIWEI GUIDE</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onNavigateTab('home')}
              className="px-5 py-2 rounded-full border border-stone-200 hover:border-[#000053] hover:text-[#000053] text-stone-600 transition-all active:scale-95 font-serif text-sm cursor-pointer"
            >
              首頁
            </button>
            <button
              onClick={() => onNavigateTab('dining')}
              className="px-5 py-2 rounded-full border border-stone-200 hover:border-[#000053] hover:text-[#000053] text-stone-600 transition-all active:scale-95 font-serif text-sm cursor-pointer"
            >
              佳餚
            </button>
            <button
              onClick={() => onNavigateTab('travel')}
              className="px-5 py-2 rounded-full border border-stone-200 hover:border-[#000053] hover:text-[#000053] text-stone-600 transition-all active:scale-95 font-serif text-sm cursor-pointer"
            >
              旅行
            </button>
            <button
              onClick={() => onNavigateTab('story')}
              className="px-5 py-2 rounded-full border border-stone-200 hover:border-[#000053] hover:text-[#000053] text-stone-600 transition-all active:scale-95 font-serif text-sm cursor-pointer"
            >
              網誌
            </button>
            <button
              onClick={() => onNavigateTab('about')}
              className="px-5 py-2 rounded-full border border-stone-200 hover:border-[#000053] hover:text-[#000053] text-stone-600 transition-all active:scale-95 font-serif text-sm cursor-pointer"
            >
              關於
            </button>
          </div>
        </div>
      </div>

      {/* Email Action Sheet / Dialog Modal */}
      {showEmailActionSheet && (
        <div 
          className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in-up"
          onClick={() => setShowEmailActionSheet(false)}
        >
          <div 
            className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl border-t sm:border border-stone-200 relative animate-modal-enter"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile drag handle bar */}
            <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto mb-4 sm:hidden" />

            <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-[#000053] font-serif">主編電子信箱</h3>
                <p className="text-xs text-stone-400 font-mono mt-0.5 select-all font-medium text-[#C5A059]">willy2005109@gmail.com</p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowEmailActionSheet(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Action options list */}
            <div className="space-y-2 mb-4">
              {/* Option 1: Copy Email */}
              <button
                type="button"
                onClick={handleCopyEmail}
                className="w-full flex items-center justify-between p-3.5 bg-stone-50 hover:bg-[#000053]/5 border border-stone-200 hover:border-[#000053]/30 rounded-xl transition-all active:scale-98 group cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-[#000053] group-hover:bg-[#000053] group-hover:text-white transition-colors">
                    {isCopiedEmail ? <CheckIcon className="w-5 h-5 text-emerald-600 group-hover:text-white" /> : <DocumentDuplicateIcon className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-stone-800 group-hover:text-[#000053] block">
                      {isCopiedEmail ? '已成功複製信箱！' : '複製信箱地址'}
                    </span>
                    <span className="text-[11px] text-stone-400 font-sans">複製至裝置剪貼簿</span>
                  </div>
                </div>
                <span className="text-xs font-sans text-stone-400 group-hover:text-[#000053]">
                  {isCopiedEmail ? '✓' : '複製'}
                </span>
              </button>

              {/* Option 2: Open Native Mail App */}
              <button
                type="button"
                onClick={handleOpenMailApp}
                className="w-full flex items-center justify-between p-3.5 bg-stone-50 hover:bg-[#000053]/5 border border-stone-200 hover:border-[#000053]/30 rounded-xl transition-all active:scale-98 group cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-[#000053] group-hover:bg-[#000053] group-hover:text-white transition-colors">
                    <EnvelopeIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-stone-800 group-hover:text-[#000053] block">開啟預設郵件 App</span>
                    <span className="text-[11px] text-stone-400 font-sans">以系統預設郵件軟體（如 Apple Mail、Outlook）開啟</span>
                  </div>
                </div>
                <ArrowTopRightOnSquareIcon className="w-4 h-4 text-stone-400 group-hover:text-[#000053]" />
              </button>

              {/* Option 3: Open Gmail Web (Great for desktop) */}
              <button
                type="button"
                onClick={handleOpenGmailWeb}
                className="w-full flex items-center justify-between p-3.5 bg-stone-50 hover:bg-[#000053]/5 border border-stone-200 hover:border-[#000053]/30 rounded-xl transition-all active:scale-98 group cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-[#000053] group-hover:bg-[#000053] group-hover:text-white transition-colors">
                    <GlobeIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-stone-800 group-hover:text-[#000053] block">以 Gmail 網頁版開啟</span>
                    <span className="text-[11px] text-stone-400 font-sans">在瀏覽器新分頁中直接開啟 Gmail 撰寫信件</span>
                  </div>
                </div>
                <ArrowTopRightOnSquareIcon className="w-4 h-4 text-stone-400 group-hover:text-[#000053]" />
              </button>
            </div>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={() => setShowEmailActionSheet(false)}
              className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors active:scale-98 cursor-pointer"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="py-12 text-center border-t border-stone-200 mt-auto bg-[#f4f4f4]">
        <p className="font-serif text-[#000053] font-bold text-lg">LIWEI GUIDE</p>
        <p className="text-xs text-stone-400 uppercase tracking-widest mt-1">EST. 2005</p>
        <p className="text-xs text-stone-400 mt-2 font-sans">© 2026 LIWEI GUIDE. All Rights Reserved.</p>
      </div>
    </div>
  );
};

export default ContactView;
