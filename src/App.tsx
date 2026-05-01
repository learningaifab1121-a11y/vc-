/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, useScroll, useTransform } from "motion/react";
import { 
  Coffee, 
  Car, 
  Utensils, 
  Users, 
  Image as ImageIcon, 
  ChevronRight, 
  Star,
  Instagram,
  Facebook,
  Twitter,
  MapPin,
  Phone,
  Clock,
  LogOut,
  Send,
  Edit2,
  Save,
  X,
  Settings
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { onAuthStateChanged, User, updateProfile } from "firebase/auth";
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  updateDoc
} from "firebase/firestore";
import { auth, db, signInWithGoogle, logout } from "./lib/firebase";

// --- Error Handling ---

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Components ---

const Navbar = ({ onNavigate, currentView, userData }: { onNavigate: (view: 'home' | 'profile') => void, currentView: string, userData: any }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Sync user profile to Firestore
        const userRef = doc(db, 'users', u.uid);
        try {
          const userDoc = await getDoc(userRef);
          if (!userDoc.exists()) {
            await setDoc(userRef, {
              displayName: u.displayName || 'Anonymous Member',
              photoURL: u.photoURL || `https://i.pravatar.cc/150?u=${u.uid}`,
              role: 'member',
              updatedAt: serverTimestamp()
            });
          }
        } catch (e) {
          console.error("Error syncing user:", e);
        }
      }
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      unsubscribe();
    };
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled || currentView === 'profile' ? "bg-brand-dark/80 backdrop-blur-md py-4 border-b border-surface-800" : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <div className="w-10 h-10 bg-brand-orange flex items-center justify-center rounded-lg rotate-3 transform group-hover:rotate-12 transition-transform">
            <span className="font-black text-xl italic text-white">V&C</span>
          </div>
          <span className="font-display font-bold text-2xl tracking-tighter uppercase italic">极速咖啡馆 <span className="text-brand-highlight text-sm font-normal not-italic lowercase">Velocity Cafe</span></span>
        </div>
        
        <div className="hidden md:flex items-center gap-10">
          {["精选菜单", "汽车鉴赏", "会员评论"].map((item) => (
            <button 
              key={item} 
              onClick={() => {
                onNavigate('home');
                setTimeout(() => {
                  const element = document.getElementById(item);
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }} 
              className="text-xs font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-[0.2em]"
            >
              {item}
            </button>
          ))}
          <button 
            onClick={() => onNavigate('home')}
            className={`text-xs font-bold transition-colors uppercase tracking-[0.2em] ${currentView === 'home' ? 'text-brand-orange' : 'text-zinc-400 hover:text-white'}`}
          >
            社区首页
          </button>
          
          {user ? (
            <div className="flex items-center gap-6">
              <button 
                onClick={() => onNavigate('profile')}
                className={`flex items-center gap-3 group px-4 py-2 rounded-xl transition-all ${currentView === 'profile' ? 'bg-surface-800 ring-1 ring-brand-orange' : 'hover:bg-surface-900'}`}
              >
                <img src={userData?.photoURL || user.photoURL!} alt="Profile" className="w-8 h-8 rounded-full border border-brand-orange shadow-lg" referrerPolicy="no-referrer" />
                <span className={`text-xs font-black uppercase tracking-widest ${currentView === 'profile' ? 'text-white' : 'text-zinc-400 group-hover:text-white'}`}>个人资料</span>
              </button>
              <button 
                onClick={() => {
                  logout();
                  onNavigate('home');
                }}
                className="text-zinc-500 hover:text-red-500 transition-colors"
                title="退出登录"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={signInWithGoogle}
              className="bg-brand-orange text-white px-6 py-2 text-xs font-black uppercase tracking-widest hover:bg-brand-highlight transition-all rounded-lg"
            >
              会员登录
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

const Hero = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);

  return (
    <section id="首页" className="relative h-screen flex items-center overflow-hidden">
      <motion.div 
        style={{ y: y1 }}
        className="absolute inset-0 z-0"
      >
        <img 
          src="https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=2000" 
          alt="Sports car in cafe"
          className="w-full h-full object-cover opacity-40 grayscale"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/40 to-transparent" />
      </motion.div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[2px] w-12 bg-brand-orange rounded-full" />
            <span className="text-brand-orange font-mono text-xs font-bold tracking-[0.4em] uppercase">Engineered for Passion</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-display font-black leading-[0.9] mb-8 uppercase italic tracking-tighter text-balance">
            速度与醇香的<br />
            <span className="text-brand-highlight underline decoration-8 underline-offset-12">完美融合</span>
          </h1>
          <p className="text-lg text-zinc-400 mb-12 max-w-lg leading-relaxed font-medium">
            在这里，每个弯道都伴随着咖啡的香气。为汽车发烧友打造的专属社交空间。
          </p>
          <div className="flex flex-wrap gap-6">
            <button className="bg-brand-orange text-white px-10 py-5 font-black uppercase tracking-widest flex items-center gap-2 group rounded-xl hover:bg-brand-highlight transition-all shadow-lg shadow-brand-orange/20">
              特色餐单 <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="bg-surface-900 border border-surface-800 hover:border-zinc-500 transition-all px-10 py-5 font-black uppercase tracking-widest rounded-xl">
              预约席位
            </button>
          </div>
        </motion.div>
      </div>
      
      <div className="absolute bottom-12 right-12 z-10 hidden lg:block scale-110">
        <div className="border border-surface-800 p-8 backdrop-blur-xl bg-surface-900/60 rounded-2xl shadow-2xl max-w-sm">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-brand-orange ring-4 ring-brand-orange/10">
              <img src="https://i.pravatar.cc/150?u=1" alt="Member" referrerPolicy="no-referrer" />
            </div>
            <div>
              <p className="text-base font-black italic uppercase tracking-tighter">极速玩家</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-3.5 h-3.5 fill-brand-highlight text-brand-highlight" />)}
              </div>
            </div>
          </div>
          <p className="text-sm text-zinc-300 italic leading-relaxed">"这里的引擎声和咖啡香一样迷人。下午三点，阳光洒在车身上，这就是完美周六。"</p>
        </div>
      </div>
    </section>
  );
};

const Menu = ({ onAddToCart }: { onAddToCart: (item: any) => void }) => {
  const [activeCategory, setActiveCategory] = useState("全部");
  
  const menuItems = [
    { name: "涡轮美式", desc: "极速唤醒你的味蕾，深度烘焙豆，苦涩中带着坚韧。", price: "¥28", category: "咖啡", image: "https://images.unsplash.com/photo-1510970174549-0639e081395b?auto=format&fit=crop&q=80&w=800" },
    { name: "活塞意式浓缩", desc: "高压萃取的精华，如同引擎的核心动力。", price: "¥25", category: "咖啡", image: "https://images.unsplash.com/photo-1442111162453-27038e21a48c?auto=format&fit=crop&q=80&w=800" },
    { name: "赛道限定汉堡", desc: "厚实的多汁牛肉，搭配秘制酱料，爆发力十足。", price: "¥68", category: "主食", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800" },
    { name: "碳纤维提拉米苏", desc: "独特的黑色可可粉装饰，口感丝滑如专业赛道。", price: "¥42", category: "甜点", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&q=80&w=800" }
  ];

  const filteredItems = activeCategory === "全部" 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  return (
    <section id="精选菜单" className="py-32 bg-brand-dark">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div>
            <h2 className="text-5xl font-display font-black uppercase mb-4 italic tracking-tighter">
              <span className="w-2.5 h-10 bg-brand-orange rounded-full inline-block mr-4 align-middle"></span>
              特色能量补给站
            </h2>
            <p className="text-zinc-500 max-w-md font-medium text-lg italic">Energy Station / 精选特调</p>
          </div>
          <div className="flex gap-3 bg-surface-900 p-1.5 rounded-xl border border-surface-800">
            {["全部", "咖啡", "主食", "甜点"].map(f => (
              <button 
                key={f} 
                onClick={() => setActiveCategory(f)}
                className={`px-8 py-2.5 text-xs font-black uppercase tracking-widest transition-all rounded-lg ${activeCategory === f ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/20" : "text-zinc-500 hover:text-white"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {filteredItems.map((item, idx) => (
            <motion.div 
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={item.name}
              whileHover={{ y: -12 }}
              className="group bg-surface-900 p-6 rounded-2xl border border-surface-800 hover:border-brand-orange transition-all duration-500 relative overflow-hidden"
            >
              <div className="aspect-[4/5] mb-8 overflow-hidden relative rounded-xl border border-surface-800">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 bg-brand-orange/90 backdrop-blur-md text-white px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                  {item.category}
                </div>
              </div>
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-black font-display uppercase italic tracking-tight">{item.name}</h3>
                <span className="text-brand-highlight font-mono font-bold text-lg">{item.price}</span>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed font-medium mb-4">{item.desc}</p>
              <button 
                onClick={() => onAddToCart(item)}
                className="w-full py-3 bg-zinc-950 border border-surface-800 rounded-xl text-xs font-black uppercase tracking-widest group-hover:bg-brand-orange group-hover:border-brand-orange transition-all duration-300"
              >
                加入订单
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const Gallery = ({ showActions = false, userIdFilter }: { showActions?: boolean, userIdFilter?: string }) => {
  const [photos, setPhotos] = useState<any[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newCaption, setNewCaption] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadMode, setUploadMode] = useState<"url" | "file">("url");

  useEffect(() => {
    let q = query(collection(db, "photos"), orderBy("createdAt", "desc"));
    
    // If a userIdFilter is provided, only show photos for that user
    if (userIdFilter) {
      // Note: This requires a composite index in Firestore for userId + createdAt
      // For now, we fetch all and filter in memory if index not yet set up, 
      // but let's try the secure query way.
      // q = query(collection(db, "photos"), where("userId", "==", userIdFilter), orderBy("createdAt", "desc"));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (userIdFilter) {
        docs = docs.filter((d: any) => d.userId === userIdFilter);
      }
      setPhotos(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "photos");
    });

    const authUnsubscribe = onAuthStateChanged(auth, (u) => setUser(u));

    return () => {
      unsubscribe();
      authUnsubscribe();
    };
  }, [userIdFilter]);

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 800000) { // Limit to ~800KB for Firestore document size constraints
        alert("文件太大，请上传小于 800KB 的图片以确保极速加载。");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPhoto = async (e: any) => {
    e.preventDefault();
    if (!user || !newPhotoUrl.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "photos"), {
        userId: user.uid,
        imageUrl: newPhotoUrl,
        caption: newCaption || "极速瞬间",
        createdAt: serverTimestamp()
      });
      setNewPhotoUrl("");
      setNewCaption("");
      setIsAdding(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "photos");
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultPhotos = [
    { imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800", caption: "911 GT3 RS by @LinSpeed" },
    { imageUrl: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=800", caption: "F40 Classic by @VintageAce" },
    { imageUrl: "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80&w=800", caption: "M4 CSL by @BimmerFan" },
    { imageUrl: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800", caption: "Huracan STO by @V10Lover" },
    { imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800", caption: "Dodge Viper by @SnakeEyes" },
    { imageUrl: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=800", caption: "Aventador SVJ by @LamboKing" }
  ];

  const displayPhotos = photos.length > 0 ? photos : defaultPhotos;

  return (
    <section id="汽车鉴赏" className={`py-32 ${showActions ? "bg-transparent" : "bg-zinc-950"}`}>
      <div className="max-w-7xl mx-auto px-6">
        {!showActions && (
          <div className="flex items-center justify-between mb-16 px-4">
            <div className="flex items-center gap-6">
              <div className="h-16 w-1.5 bg-brand-orange rounded-full" />
              <div>
                <h2 className="text-5xl font-display font-black uppercase italic tracking-tighter text-white">会员汽车影像赏析</h2>
                <p className="text-zinc-500 mt-2 font-mono text-sm uppercase tracking-[0.3em]">Gallery / Community 016</p>
              </div>
            </div>
            <div className="hidden md:block">
              <span className="text-zinc-700 font-mono text-8xl font-black italic opacity-20 select-none uppercase">Image</span>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayPhotos.map((p, i) => (
            <motion.div 
              key={p.id || i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 3) * 0.1 }}
              className="relative aspect-video overflow-hidden group cursor-pointer rounded-2xl border border-surface-800 hover:border-brand-highlight transition-all duration-500 shadow-lg"
            >
              <img 
                src={p.imageUrl} 
                alt={p.caption} 
                className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-black italic uppercase tracking-tight text-lg">{p.caption}</h4>
                    <p className="text-brand-orange text-xs font-bold font-mono">
                      {p.userId ? `SHOT BY @USER_${p.userId.substring(0, 5)}` : "FEATURED WORK"}
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20">
                    <ImageIcon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {showActions && (
          <div className="mt-20">
            {isAdding ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl mx-auto bg-surface-900/50 backdrop-blur-md p-8 rounded-3xl border border-surface-800 shadow-2xl relative"
              >
                <h4 className="font-black italic uppercase tracking-tight mb-8">分享你的极速瞬间</h4>
                
                <div className="flex bg-zinc-950 p-1 rounded-xl mb-6 border border-surface-800">
                  <button 
                    onClick={() => setUploadMode("url")}
                    className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${uploadMode === "url" ? "bg-brand-orange text-white" : "text-zinc-500 hover:text-white"}`}
                  >
                    网址链接
                  </button>
                  <button 
                    onClick={() => setUploadMode("file")}
                    className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${uploadMode === "file" ? "bg-brand-orange text-white" : "text-zinc-500 hover:text-white"}`}
                  >
                    本地文件
                  </button>
                </div>

                <form onSubmit={handleAddPhoto} className="space-y-4 text-left">
                  {uploadMode === "url" ? (
                    <div className="relative group">
                      <input 
                        type="url"
                        required={uploadMode === "url"}
                        value={newPhotoUrl || ""}
                        onChange={(e) => setNewPhotoUrl(e.target.value)}
                        placeholder="粘贴图片链接 (Unsplash, Pixabay etc.)"
                        className="w-full bg-zinc-950 border border-surface-800 rounded-xl p-4 text-sm text-zinc-300 focus:border-brand-orange focus:outline-none transition-all"
                      />
                    </div>
                  ) : (
                    <div className="relative border-2 border-dashed border-surface-800 rounded-xl p-8 hover:border-brand-orange transition-all group overflow-hidden">
                      {newPhotoUrl ? (
                        <div className="flex flex-col items-center">
                          <img src={newPhotoUrl} className="h-32 rounded-lg mb-4 object-cover" />
                          <button onClick={() => setNewPhotoUrl("")} className="text-xs text-red-500 font-bold uppercase underline">重选文件</button>
                        </div>
                      ) : (
                        <>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                          />
                          <div className="text-center group-hover:scale-105 transition-transform">
                            <ImageIcon className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
                            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">点击或拖拽上传图片<br/><span className="text-[10px] opacity-50">(限制 800KB 以内)</span></p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  
                  <input 
                    type="text"
                    value={newCaption || ""}
                    onChange={(e) => setNewCaption(e.target.value)}
                    placeholder="为你的座驾提词..."
                    className="w-full bg-zinc-950 border border-surface-800 rounded-xl p-4 text-sm text-zinc-300 focus:border-brand-orange focus:outline-none transition-all"
                  />
                  
                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => { setIsAdding(false); setNewPhotoUrl(""); }}
                      className="flex-1 border border-surface-800 text-zinc-500 font-black uppercase tracking-widest py-4 rounded-xl hover:bg-surface-800 transition-all"
                    >
                      取消
                    </button>
                    <button 
                      disabled={isSubmitting || !newPhotoUrl.trim()}
                      className="flex-[2] bg-brand-orange hover:bg-brand-highlight disabled:opacity-50 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg shadow-brand-orange/20"
                    >
                      {isSubmitting ? "引擎加热中..." : "发布作品"}
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <div className="text-center">
                <button 
                  onClick={() => setIsAdding(true)}
                  className="bg-brand-orange text-white px-12 py-5 text-xs font-black uppercase tracking-[0.4em] transition-all rounded-2xl shadow-xl shadow-brand-orange/20 hover:-translate-y-1"
                >
                  发布新的影像作品
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

const Reviews = ({ showActions = false, userIdFilter }: { showActions?: boolean, userIdFilter?: string }) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (userIdFilter) {
        docs = docs.filter((d: any) => d.userId === userIdFilter);
      }
      setReviews(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "reviews");
    });

    const authUnsubscribe = onAuthStateChanged(auth, (u) => setUser(u));

    return () => {
      unsubscribe();
      authUnsubscribe();
    };
  }, [userIdFilter]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "reviews"), {
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        userAvatar: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
        text: newComment,
        rating: rating,
        createdAt: serverTimestamp()
      });
      setNewComment("");
      setRating(5);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "reviews");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="会员评论" className={`py-32 ${showActions ? "bg-transparent" : "bg-brand-dark border-t border-surface-800"}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-start gap-20">
          <div className="lg:w-1/3 lg:sticky lg:top-32">
            {!showActions ? (
              <h2 className="text-5xl font-display font-black uppercase mb-8 italic tracking-tighter leading-tight">
                会员社区动态 <br /><span className="text-brand-orange underline underline-offset-8 decoration-4">COMMUNITY</span>
              </h2>
            ) : (
              <div className="bg-surface-900 border border-surface-800 p-8 rounded-2xl shadow-xl">
                <h4 className="font-black italic uppercase tracking-tight mb-6">发表你的声音</h4>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button 
                        key={s} 
                        type="button"
                        onClick={() => setRating(s)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star className={`w-5 h-5 ${rating >= s ? "fill-brand-highlight text-brand-highlight" : "text-zinc-600"}`} />
                      </button>
                    ))}
                  </div>
                  <textarea 
                    value={newComment || ""}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="分享你今天的驾驶心得或咖啡体验..."
                    className="w-full bg-zinc-950 border border-surface-800 rounded-xl p-4 text-sm text-zinc-300 focus:border-brand-orange focus:outline-none min-h-[120px] transition-all"
                  />
                  <button 
                    disabled={isSubmitting || !newComment.trim()}
                    className="w-full bg-brand-orange hover:bg-brand-highlight disabled:opacity-50 disabled:grayscale text-white font-black uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    {isSubmitting ? "正在加速引擎..." : "发布评论"} <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
            
            {!user && !showActions && (
              <div className="bg-surface-900 border border-surface-800 p-8 rounded-2xl text-center mt-10">
                <Users className="w-12 h-12 text-brand-orange mx-auto mb-4 opacity-50" />
                <h4 className="font-black italic uppercase tracking-tight mb-3 text-lg">加入我们的社区</h4>
                <p className="text-zinc-500 text-sm mb-6 leading-relaxed">登录会员账号，与全国车友分享你的极速时光。</p>
                <button 
                  onClick={signInWithGoogle}
                  className="w-full bg-white text-black font-black uppercase tracking-widest py-3 rounded-xl hover:bg-brand-orange hover:text-white transition-all shadow-lg"
                >
                  会员登录
                </button>
              </div>
            )}
          </div>
          
          <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8">
            {reviews.length > 0 ? (
              reviews.map((r, i) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={r.id || i} 
                  className="bg-surface-900 p-10 border border-surface-800 rounded-3xl relative group hover:border-brand-orange transition-all duration-500 shadow-xl"
                >
                  <div className="absolute top-10 right-10 text-brand-orange/10 group-hover:text-brand-orange/20 transition-all">
                    <svg className="w-16 h-16 fill-current" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V12C14.017 12.5523 13.5693 13 13.017 13H11.017V21H14.017ZM5.017 21L5.017 18C5.017 16.8954 5.91243 16 7.017 16H10.017C10.5693 16 11.017 15.5523 11.017 15V9C11.017 8.44772 10.5693 8 10.017 8H6.017C5.46472 8 5.017 8.44772 5.017 9V12C5.017 12.5523 4.56928 13 4.017 13H2.017V21H5.017Z" /></svg>
                  </div>
                  <div className="flex items-center gap-5 mb-8">
                    <div className="relative">
                      <img src={r.userAvatar} alt={r.userName} className="w-16 h-16 rounded-2xl border-2 border-surface-800 group-hover:border-brand-orange transition-all duration-500 grayscale group-hover:grayscale-0 shadow-lg" referrerPolicy="no-referrer" />
                      <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-brand-orange rounded-lg flex items-center justify-center border-2 border-surface-900">
                        <Star className="w-3 h-3 text-white fill-current" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-black italic uppercase tracking-tight">{r.userName}</h4>
                      <div className="flex mt-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`w-3 h-3 ${r.rating >= s ? "fill-brand-highlight text-brand-highlight" : "text-zinc-700"}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-zinc-400 font-medium italic leading-relaxed text-lg">"{r.text}"</p>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-surface-800 rounded-3xl">
                <p className="text-zinc-600 font-black italic uppercase tracking-widest">暂无社区动态，等待第一位会员发声...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-zinc-950 px-6 py-20 border-t border-surface-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 bg-brand-orange flex items-center justify-center rounded-xl rotate-3">
                 <span className="font-black text-2xl italic text-white leading-none">V&C</span>
              </div>
              <span className="font-display font-black text-3xl tracking-tighter uppercase italic">Velocity Cafe</span>
            </div>
            <p className="text-zinc-500 mb-10 max-w-sm font-medium leading-relaxed">
              这里不仅是品味咖啡的地方，更是速度与热情的圣地。每一位车迷在这里都能找到共鸣。
            </p>
            <div className="flex gap-5">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-12 h-12 border border-surface-800 flex items-center justify-center hover:bg-brand-orange hover:border-brand-orange hover:text-white transition-all rounded-xl shadow-lg">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-black uppercase tracking-[0.2em] mb-10 text-xs text-brand-orange">联系方式 / Contact</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4 text-zinc-500 font-medium group cursor-pointer">
                <MapPin className="w-5 h-5 text-brand-orange shrink-0 group-hover:scale-110 transition-transform" />
                <span className="group-hover:text-zinc-300 transition-colors">上海市静安区赛车大道 195 号极速创意园区</span>
              </li>
              <li className="flex items-center gap-4 text-zinc-500 font-medium group cursor-pointer">
                <Phone className="w-5 h-5 text-brand-orange shrink-0 group-hover:scale-110 transition-transform" />
                <span className="group-hover:text-zinc-300 transition-colors">+86 21 8888 6666</span>
              </li>
              <li className="flex items-center gap-4 text-zinc-500 font-medium group cursor-pointer">
                <Clock className="w-5 h-5 text-brand-orange shrink-0 group-hover:scale-110 transition-transform" />
                <span className="group-hover:text-zinc-300 transition-colors">09:00 - 23:00</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-black uppercase tracking-[0.2em] mb-10 text-xs text-brand-orange">快速链接 / Links</h4>
            <ul className="space-y-6">
              {["精选菜单", "汽车鉴赏", "加入会员", "官方相册"].map(link => (
                <li key={link}>
                  <a href="#" className="text-zinc-500 hover:text-brand-orange font-bold transition-all text-sm uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-brand-orange rounded-full opacity-0 -ml-4 group-hover:opacity-100 transition-all" />
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="bg-brand-orange rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-black uppercase tracking-[0.3em] text-white shadow-xl shadow-brand-orange/20">
          <div className="flex gap-6 italic">
            <span>今日推荐：赛道日限定特调</span>
            <span className="hidden md:inline opacity-50">|</span>
            <span>营业状态：加速中 🟢</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="opacity-70">Member Count:</span> 2,481
          </div>
        </div>
        
        <div className="mt-12 text-center text-[10px] text-zinc-700 font-bold uppercase tracking-[0.5em]">
          © 2026 VELOCITY CAFE. ENGINEERED FOR PASSION.
        </div>
      </div>
    </footer>
  );
};

// --- Main App ---

const MemberProfile = ({ user, userData }: { user: User, userData: any }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState(userData?.displayName || user.displayName || "");
  const [editPhotoURL, setEditPhotoURL] = useState(userData?.photoURL || user.photoURL || "");
  const [profileUploadMode, setProfileUploadMode] = useState<"url" | "file">("url");
  const [isSaving, setIsSaving] = useState(false);

  // Sync edits when userData changes (e.g. from Firestore update)
  useEffect(() => {
    if (userData && !isEditing) {
      setEditDisplayName(userData.displayName || "");
      setEditPhotoURL(userData.photoURL || "");
    }
  }, [userData, isEditing]);

  const handleProfileFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 800000) {
        alert("头像文件太大，请使用小于 800KB 的图片。");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditPhotoURL(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!auth.currentUser) return;
    setIsSaving(true);
    try {
      // 1. Update Auth Profile (only if photoURL is short enough)
      // Firebase Auth photoURL limit is around 2048 chars
      const isPhotoShort = editPhotoURL.length < 2000;
      
      try {
        await updateProfile(auth.currentUser, {
          displayName: editDisplayName,
          photoURL: isPhotoShort ? editPhotoURL : (auth.currentUser.photoURL || "")
        });
      } catch (authError) {
        console.warn("Failed to update Auth profile, but continuing with Firestore sync:", authError);
      }

      // 2. Update Firestore User Doc (always source of truth)
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: editDisplayName,
        photoURL: editPhotoURL,
        updatedAt: serverTimestamp()
      });

      setIsEditing(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setIsSaving(false);
    }
  };

  const displayPhoto = isEditing ? editPhotoURL : (userData?.photoURL || user.photoURL!);
  const displayName = isEditing ? editDisplayName : (userData?.displayName || user.displayName!);

  return (
    <section className="pt-40 pb-20 bg-brand-dark min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {/* Profile Header */}
        <div className="bg-surface-900 border border-surface-800 rounded-3xl p-12 mb-16 relative overflow-hidden shadow-2xl">
          <div className="absolute -right-20 -top-20 text-brand-orange opacity-5 pointer-events-none">
            <Users size={400} />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="relative group">
              <img 
                src={displayPhoto} 
                className="w-40 h-40 rounded-3xl border-4 border-brand-orange shadow-2xl rotate-3" 
                referrerPolicy="no-referrer" 
              />
              {isEditing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity rotate-3 pointer-events-none">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">预览中</span>
                </div>
              )}
            </div>
            
            <div className="text-center md:text-left flex-1">
              {isEditing ? (
                <div className="space-y-4 max-w-md mx-auto md:mx-0">
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1 block">昵称 / Display Name</label>
                    <input 
                      type="text"
                      value={editDisplayName}
                      onChange={(e) => setEditDisplayName(e.target.value)}
                      className="w-full bg-zinc-950 border border-surface-800 rounded-xl px-4 py-3 text-white focus:border-brand-orange focus:outline-none transition-all font-black uppercase italic tracking-tighter text-2xl"
                      placeholder="输入新昵称..."
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">头像设置 / Photo Profile</label>
                    <div className="flex bg-zinc-950 p-1 rounded-xl mb-3 border border-surface-800">
                      <button 
                        onClick={() => setProfileUploadMode("url")}
                        className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${profileUploadMode === "url" ? "bg-brand-orange text-white" : "text-zinc-500 hover:text-white"}`}
                      >
                        网址
                      </button>
                      <button 
                        onClick={() => setProfileUploadMode("file")}
                        className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${profileUploadMode === "file" ? "bg-brand-orange text-white" : "text-zinc-500 hover:text-white"}`}
                      >
                        本地上传
                      </button>
                    </div>

                    {profileUploadMode === "url" ? (
                      <input 
                        type="url"
                        value={editPhotoURL}
                        onChange={(e) => setEditPhotoURL(e.target.value)}
                        className="w-full bg-zinc-950 border border-surface-800 rounded-xl px-4 py-3 text-white focus:border-brand-orange focus:outline-none transition-all text-sm font-mono"
                        placeholder="输入图片 URL..."
                      />
                    ) : (
                      <div className="relative border-2 border-dashed border-surface-800 rounded-xl p-4 hover:border-brand-orange transition-all group text-center cursor-pointer">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleProfileFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                          {editPhotoURL.startsWith('data:') ? "已选择本地文件" : "点击上传新头像"}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="flex-1 bg-brand-orange hover:bg-brand-highlight text-white font-black uppercase tracking-widest py-3 rounded-xl transition-all shadow-lg shadow-brand-orange/20 flex items-center justify-center gap-2"
                    >
                      {isSaving ? <span className="animate-pulse">保存中...</span> : <><Save size={16} /> 保存修改</>}
                    </button>
                    <button 
                      onClick={() => {
                        setIsEditing(false);
                        setEditDisplayName(userData?.displayName || user.displayName || "");
                        setEditPhotoURL(userData?.photoURL || user.photoURL || "");
                      }}
                      className="flex-1 border border-surface-800 text-zinc-500 hover:text-white font-black uppercase tracking-widest py-3 rounded-xl hover:bg-surface-800 transition-all flex items-center justify-center gap-2"
                    >
                      <X size={16} /> 取消
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center md:justify-start gap-4 mb-3">
                    <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white">{displayName}</h2>
                    <span className="bg-brand-orange text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Verified Member</span>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="p-2 text-zinc-500 hover:text-brand-orange transition-colors"
                      title="编辑资料"
                    >
                      <Edit2 size={24} />
                    </button>
                  </div>
                  <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.4em] mb-8">{user.email}</p>
                  
                  {/* Removed level and points cards per request */}
                </>
              )}
            </div>
          </div>
        </div>


        {/* Action Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <div className="space-y-6">
            <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-4">
              <ImageIcon className="w-8 h-8 text-brand-orange" />
              影像发布工具 <span className="text-zinc-700">/ UPLOAD</span>
            </h3>
            <Gallery showActions={true} userIdFilter={user.uid} />
          </div>

          <div className="space-y-6">
            <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-4">
              <Send className="w-8 h-8 text-brand-orange" />
              发布社区动态 <span className="text-zinc-700">/ POST</span>
            </h3>
            <Reviews showActions={true} userIdFilter={user.uid} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default function App() {
  const [cart, setCart] = useState<{name: string, price: string, quantity: number}[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'profile'>('home');
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        // Listen to Firestore user document
        const userRef = doc(db, 'users', u.uid);
        const unsubsDoc = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            setUserData(snapshot.data());
          }
        });
        return () => unsubsDoc();
      } else {
        setUserData(null);
      }
      if (!u && currentView === 'profile') {
        setCurrentView('home');
      }
    });
    return unsubscribe;
  }, [currentView]);

  const addToCart = (item: {name: string, price: string}) => {
    setCart(prev => {
      const existing = prev.find(i => i.name === item.name);
      if (existing) {
        return prev.map(i => i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (name: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.name === name) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const total = cart.reduce((sum, item) => {
    const priceNum = parseInt(item.price.replace("¥", ""));
    return sum + (priceNum * item.quantity);
  }, 0);

  return (
    <div className="min-h-screen selection:bg-brand-orange selection:text-white relative bg-brand-dark">
      <Navbar onNavigate={setCurrentView} currentView={currentView} userData={userData} />
      
      <main>
        {currentView === 'home' ? (
          <>
            <Hero />
            <Menu onAddToCart={addToCart} />
            <Gallery />
            <Reviews />
          </>
        ) : (
          user && <MemberProfile user={user} userData={userData} />
        )}
      </main>
      
      <Footer />

      {/* Floating Cart Button */}
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-8 left-8 z-40 bg-brand-orange text-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl shadow-brand-orange/40 group"
      >
        <Utensils className="w-8 h-8 group-hover:rotate-12 transition-transform" />
        {cart.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-white text-brand-orange w-6 h-6 rounded-full text-xs font-black flex items-center justify-center border-2 border-brand-orange">
            {cart.reduce((s, i) => s + i.quantity, 0)}
          </span>
        )}
      </motion.button>

      {/* Cart Drawer Overlay */}
      {isCartOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" 
          />
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-brand-dark border-l border-surface-800 z-[70] shadow-2xl p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-3xl font-black italic uppercase tracking-tighter">极速订单 <span className="text-brand-orange">ORDER</span></h3>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                关闭 (ESC)
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              {cart.length > 0 ? (
                cart.map((item, idx) => (
                  <div key={idx} className="bg-surface-900 p-6 rounded-2xl border border-surface-800 flex justify-between items-center">
                    <div>
                      <h4 className="font-black italic uppercase tracking-tight text-lg">{item.name}</h4>
                      <p className="text-brand-highlight font-mono font-bold">{item.price}</p>
                    </div>
                    <div className="flex items-center gap-4 bg-zinc-950 p-2 rounded-xl border border-surface-800">
                      <button 
                        onClick={() => updateQuantity(item.name, -1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-surface-800 rounded-lg transition-colors text-lg font-black"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.name, 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-surface-800 rounded-lg transition-colors text-lg font-black"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <Coffee size={64} className="text-zinc-800 mb-4" />
                  <p className="text-zinc-500 font-bold uppercase tracking-widest italic">引擎尚未启动，快去添加点补给吧</p>
                </div>
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-surface-800">
              <div className="flex justify-between items-end mb-8">
                <span className="text-zinc-500 uppercase font-black tracking-widest text-xs">预计支出 TOTAL EXPENDITURE</span>
                <span className="text-4xl font-black italic text-brand-highlight tracking-tighter">¥{total}</span>
              </div>
              <button 
                disabled={cart.length === 0}
                className="w-full bg-brand-orange hover:bg-brand-highlight disabled:grayscale disabled:opacity-50 text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-brand-orange/20 transition-all text-sm"
              >
                确认下单 START MISSION
              </button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
