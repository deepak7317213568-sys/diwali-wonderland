import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import {
  Share2,
  Copy,
  Check,
  Send,
  Sparkles,
  Users,
  ShieldCheck,
  UserCheck,
  Edit2,
  Save,
} from 'lucide-react';
import { triggerFestiveConfetti } from '../../utils/confetti.js';
import { audioEngine } from '../../utils/audioSystem.js';
import { getTranslation } from '../../utils/translations.js';
import { trackEvent } from '../../utils/analyticsService.js';

export const ReferralScreen = ({ referralState, language = 'en' }) => {
  const qrCanvasRef = useRef(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [nameSavedSuccess, setNameSavedSuccess] = useState(false);

  const t = (key) => getTranslation(language, key);

  const {
    userName,
    referralCode,
    referralStats,
    isCopied,
    getShareUrl,
    copyShareLink,
    getWhatsAppShareUrl,
    shareNative,
    updateUserName,
  } = referralState;

  useEffect(() => {
    setNameInput(userName || 'Deepak Prajapati');
  }, [userName]);

  const shareUrl = getShareUrl();

  useEffect(() => {
    if (qrCanvasRef.current && shareUrl) {
      QRCode.toCanvas(
        qrCanvasRef.current,
        shareUrl,
        {
          width: 160,
          margin: 1.5,
          color: {
            dark: '#21103D',
            light: '#FFF0C2',
          },
        },
        (error) => {
          if (error) console.error('QR code generation error', error);
        }
      );
    }
  }, [shareUrl]);

  const handleCopy = async () => {
    trackEvent('invitation_shared', { channel: 'referral_copy_link' });
    const success = await copyShareLink();
    if (success) {
      audioEngine.playTap();
      triggerFestiveConfetti();
    }
  };

  const handleWhatsApp = () => {
    trackEvent('invitation_shared', { channel: 'referral_whatsapp' });
    audioEngine.playTap();
    window.open(getWhatsAppShareUrl(language), '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    trackEvent('invitation_shared', { channel: 'referral_native_share' });
    audioEngine.playTap();
    await shareNative(language);
  };

  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    audioEngine.playTap();
    const success = await updateUserName(nameInput.trim());
    if (success) {
      setEditingName(false);
      setNameSavedSuccess(true);
      triggerFestiveConfetti();
      setTimeout(() => setNameSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 flex flex-col items-center">
      {/* Top Festival Completion Banner */}
      <div className="text-center mb-6 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4A1028] border border-[#FFD36A]/50 mb-3 shadow-lg">
          <Sparkles size={16} className="text-[#FFD36A]" />
          <span className="text-xs font-cinzel font-bold text-[#FFF0C2] tracking-wider uppercase">
            {t('refCompleteBadge')}
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-cinzel-dec font-black gold-gradient-text mb-3 leading-tight">
          {t('refMainHeading')}
        </h2>

        <p className="text-sm sm:text-base font-outfit text-[#FFF9ED]/90 leading-relaxed font-light">
          {t('refMainSubtitle')}
        </p>
      </div>

      {/* Main Referral Card */}
      <div className="w-full glass-panel-gold p-6 sm:p-10 rounded-3xl border-2 border-[#FFD36A]/60 shadow-[0_0_60px_rgba(255,211,106,0.25)] relative">
        <div className="toran-border-top opacity-70 mb-6" />

        {/* Sender Name Customization Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-[#090719]/80 border border-[#FFD36A]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <UserCheck size={20} className="text-[#FFD36A] shrink-0" />
            <div>
              <span className="text-[11px] font-cinzel text-[#FFF0C2]/70 uppercase block">
                {language === 'hi' ? 'निमंत्रण भेजने वाले का नाम:' : "Inviter / Sender's Name:"}
              </span>
              {!editingName ? (
                <span className="text-base sm:text-lg font-cinzel font-bold text-[#FFD36A]">
                  {userName || 'Deepak Prajapati'}
                </span>
              ) : (
                <form onSubmit={handleSaveName} className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Enter your name"
                    className="px-3 py-1.5 rounded-lg bg-[#21103D] border border-[#FFD36A]/60 text-xs sm:text-sm text-[#FFF0C2] focus:outline-none"
                    maxLength={50}
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#FFD36A] to-[#FF8A24] text-[#090719] font-cinzel font-bold text-xs flex items-center gap-1 shadow-sm"
                  >
                    <Save size={13} /> {language === 'hi' ? 'सहेजें' : 'Save'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {!editingName && (
            <button
              onClick={() => setEditingName(true)}
              className="px-3 py-1.5 rounded-xl border border-[#FFD36A]/40 text-[#FFF0C2] hover:bg-[#FFD36A]/10 text-xs font-outfit flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Edit2 size={13} /> {language === 'hi' ? 'नाम बदलें' : 'Change Name'}
            </button>
          )}

          {nameSavedSuccess && (
            <span className="text-xs text-emerald-400 font-medium">
              ✓ {language === 'hi' ? 'नाम सफलतापूर्वक सहेजा गया!' : 'Name saved! Your links now show your name.'}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Code, Link, Action Buttons */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            <div>
              <span className="text-xs font-cinzel font-semibold text-[#FFD36A] tracking-widest uppercase block mb-1">
                {t('inviteFriends')}
              </span>
              <h3 className="text-xl sm:text-2xl font-cinzel font-bold text-[#FFF9ED] mb-2">
                {t('inviteFriendsSub')}
              </h3>
              <p className="text-xs sm:text-sm font-outfit text-[#FFF0C2]/80 leading-relaxed">
                {language === 'hi'
                  ? `जब आपके मित्र आपके लिंक को खोलेंगे, उन्हें स्क्रीन पर दिखाई देगा: "आपको यह खूबसूरत दिवाली की सौगात ${userName || 'Deepak Prajapati'} की तरफ से मिली है!"`
                  : `When friends open your link, they will see: "This beautiful Diwali experience has been shared with you by ${userName || 'Deepak Prajapati'}!"`}
              </p>
            </div>

            {/* Unique Referral Code Badge */}
            <div className="p-4 rounded-2xl bg-[#090719]/80 border border-[#FFD36A]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
              <div>
                <span className="text-[11px] font-cinzel text-[#FFF0C2]/70 block uppercase tracking-wider">
                  {t('yourUniqueCode')}
                </span>
                <span className="text-lg sm:text-xl font-cinzel font-black tracking-widest text-[#FFD36A]">
                  {referralCode || 'GENERATING...'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FFD36A] to-[#FF8A24] text-[#090719] font-cinzel font-bold text-xs flex items-center gap-1.5 hover:shadow-[0_0_15px_rgba(255,211,106,0.5)] transition-all"
                  aria-label={t('copyLink')}
                >
                  {isCopied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{isCopied ? t('copied') : t('copyLink')}</span>
                </button>
              </div>
            </div>

            {/* Direct URL Box */}
            <div className="relative">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full px-4 py-3 rounded-xl bg-[#21103D]/60 border border-[#FFD36A]/30 text-xs sm:text-sm font-outfit text-[#FFF0C2] pr-20 select-all focus:outline-none focus:border-[#FFD36A]"
              />
              <button
                onClick={handleCopy}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-outfit text-[#FFD36A] hover:text-white px-2.5 py-1 rounded-md bg-[#4A1028]"
              >
                {isCopied ? t('copied') : t('copyLink')}
              </button>
            </div>

            {/* Social Share Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={handleWhatsApp}
                className="w-full sm:w-auto flex-1 py-3 px-5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white font-cinzel font-bold text-xs sm:text-sm shadow-[0_4px_20px_rgba(37,211,102,0.35)] transition-all flex items-center justify-center gap-2"
                aria-label={t('shareWhatsApp')}
              >
                <Send size={16} />
                <span>{t('shareWhatsApp')}</span>
              </button>

              <button
                onClick={handleNativeShare}
                className="w-full sm:w-auto flex-1 py-3 px-5 rounded-full btn-royal-secondary text-xs sm:text-sm flex items-center justify-center gap-2"
                aria-label={t('nativeShare')}
              >
                <Share2 size={16} />
                <span>{t('nativeShare')}</span>
              </button>
            </div>
          </div>

          {/* Right Column: QR Code & Verified Stats */}
          <div className="lg:col-span-5 flex flex-col items-center p-6 rounded-2xl bg-[#21103D]/60 border border-[#FFD36A]/30 text-center">
            <span className="text-xs font-cinzel font-bold text-[#FFD36A] tracking-wider mb-3">
              {t('scanToJoin')}
            </span>

            <div className="p-3 bg-[#FFF0C2] rounded-2xl shadow-xl mb-4 border border-[#FFD36A]">
              <canvas ref={qrCanvasRef} className="rounded-lg" />
            </div>

            <span className="text-[11px] font-outfit text-[#FFF0C2]/80 mb-5">
              {t('scanMobilePrompt')}
            </span>

            <div className="w-full pt-4 border-t border-[#FFD36A]/20 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#090719]/60 border border-[#FFD36A]/20">
                  <span className="text-[10px] font-cinzel text-[#FFF0C2]/70 block uppercase">
                    {t('totalVisits')}
                  </span>
                  <span className="text-xl font-bold font-cinzel text-[#FFD36A]">
                    {referralStats.totalVisits}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#090719]/60 border border-[#FFD36A]/20">
                  <span className="text-[10px] font-cinzel text-[#FFF0C2]/70 block uppercase">
                    {t('completedVisits')}
                  </span>
                  <span className="text-xl font-bold font-cinzel text-[#00F5D4]">
                    {referralStats.qualifiedCount}
                  </span>
                </div>
              </div>

              {/* Status Note */}
              <div className="text-[11px] font-outfit text-left px-2 py-1.5 rounded-lg bg-black/30 border border-white/5 flex items-start gap-1.5">
                <ShieldCheck size={14} className="text-[#FFD36A] shrink-0 mt-0.5" />
                <span className="text-[#FFF0C2]/80 leading-tight">
                  {referralStats.isDbConnected ? (
                    <span className="text-emerald-400 font-medium">
                      {t('dbConnectedMsg')}
                    </span>
                  ) : (
                    <span>
                      {t('dbDemoMsg')}
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Honest Referral Rules */}
        <div className="mt-8 pt-6 border-t border-[#FFD36A]/20 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-outfit text-[#FFF9ED]/80">
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#4A1028] text-[#FFD36A] flex items-center justify-center shrink-0 font-bold text-[10px]">
              1
            </span>
            <span>
              <strong className="text-[#FFD36A] block">{t('howItWorks1Title')}</strong>
              {t('howItWorks1Desc')}
            </span>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#4A1028] text-[#FFD36A] flex items-center justify-center shrink-0 font-bold text-[10px]">
              2
            </span>
            <span>
              <strong className="text-[#FFD36A] block">{t('howItWorks2Title')}</strong>
              {t('howItWorks2Desc')}
            </span>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#4A1028] text-[#FFD36A] flex items-center justify-center shrink-0 font-bold text-[10px]">
              3
            </span>
            <span>
              <strong className="text-[#FFD36A] block">{t('howItWorks3Title')}</strong>
              {t('howItWorks3Desc')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
