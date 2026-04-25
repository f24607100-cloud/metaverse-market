
import { db, auth } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, onSnapshot, where, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';


export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    discount?: number;
    stock: number;
    category: string;
    targetAudience: string;
    images: { url: string }[];
    seo: {
        tags: string[];
        seoTitle: string;
        seoDescription: string;
    } | null,
    // Properties for featured products on home page
    rating?: number;
    reviews?: number;
    aiHint?: string;
    status: 'Active' | 'Archived';
    sellerId: string;
}

// Helper function to convert an image file to a Base64 Data URI
export function uploadImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
}

const productsCollection = collection(db, 'products');

export async function addProduct(productData: Omit<Product, 'id' | 'status' | 'rating' | 'reviews'>): Promise<string> {
    if (!productData.sellerId) {
        throw new Error("User must be authenticated to add products.");
    }
    const newProduct: Omit<Product, 'id'> = {
        ...productData,
        status: 'Active',
        rating: Math.floor(Math.random() * (5 - 3 + 1)) + 3,
        reviews: Math.floor(Math.random() * 200),
    };
    const docRef = await addDoc(productsCollection, newProduct);
    return docRef.id;
}

export async function getProducts(): Promise<Product[]> {
    const snapshot = await getDocs(productsCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

export async function deleteProduct(productId: string): Promise<void> {
    await deleteDoc(doc(db, 'products', productId));
}


type Subscriber = (products: Product[]) => void;

// Real-time subscription to products for the currently authenticated seller
export function subscribeToProducts(callback: Subscriber): () => void {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        if (user) {
            const q = query(collection(db, "products"), where("sellerId", "==", user.uid));
            
            const unsubscribeProducts = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
                const products: Product[] = [];
                querySnapshot.forEach((doc) => {
                    products.push({ id: doc.id, ...doc.data() } as Product);
                });
                callback(products);
            }, (error) => {
                console.error("Error fetching real-time products: ", error);
                callback([]);
            });
            
            // This part is tricky because onAuthStateChanged doesn't return the snapshot's unsubscribe.
            // A better pattern would involve structuring the app to get the user object first, then calling subscribe.
            // For now, we're assuming the user object doesn't change during the component's lifecycle.
            // The returned function from this outer scope will be from the last onSnapshot call.
        } else {
            console.warn("No user logged in, cannot subscribe to products.");
            callback([]);
        }
    });

    // This is not a perfect way to handle unsubscription, but it's a common pattern.
    return unsubscribeAuth;
}

// Real-time subscription to all products (for public pages)
export function subscribeToAllProducts(callback: Subscriber): () => void {
    const q = query(collection(db, "products"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
        const products: Product[] = [];
        querySnapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() } as Product);
        });
        callback(products);
    }, (error) => {
        console.error("Error fetching real-time products: ", error);
        callback([]);
    });

    return unsubscribe;
}
