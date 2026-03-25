import { STRINGS } from '@/constants/Strings'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { Heart, MapPin, MessageCircle, ShoppingBag } from 'lucide-react-native'
import React, { useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { Eye } from 'stream-chat-expo'

type Props = {
  item: any
}

const MarketPlaceCard = ({item}: Props) => {
  const [favourited, setFavourited] = useState(false);

  return (
    <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push(`/marketplace/${item.id}`)}
                className="bg-white rounded-2xl border border-slate-100 mb-4 overflow-hidden flex-row p-3 gap-4"
                style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 2,
                }}
            >
                {/* Image Section */}
                <View className="w-28 h-28 bg-slate-50 rounded-xl overflow-hidden relative">
                    {item.imageUrl ? (
                        <Image
                            source={{ uri: item.imageUrl }}
                            className="w-full h-full"
                            style={{ width: '100%', height: '100%' }}
                            contentFit="cover"
                            transition={500}
                        />
                    ) : (
                        <View className="w-full h-full items-center justify-center bg-indigo-50">
                            <ShoppingBag size={32} color="#818cf8" strokeWidth={1.5} />
                        </View>
                    )}
                    {/* Badge Overlay */}
                    <View className={`absolute top-1 left-1 px-1.5 py-0.5 rounded-md ${item.type === 'offered' ? 'bg-green-500' : 'bg-orange-500'}`}>
                        <Text className="text-[8px] font-bold text-white uppercase tracking-tighter">
                            {item.type === 'offered' ? STRINGS.MARKETPLACE.OFFERED_LABEL : STRINGS.MARKETPLACE.WANTED_LABEL}
                        </Text>
                    </View>
                </View>
    
                {/* Info Section */}
                <View className="flex-1 justify-between py-0.5">
                    <View>
                        <View className='flex-row items-center justify-between w-full'>
                            <Text className="text-base font-bold text-slate-900 leading-5" numberOfLines={2}>
                                {item.title}
                            </Text>
                            <Heart
                                size={24}
                                color={favourited ? "#ec4899" : "#94a3b8"}
                                fill={favourited ? "#ec4899" : "none"}
                                onPress={() => setFavourited(!favourited)}
                            />
                        </View>
                        <View className="flex-row items-center gap-1 mt-1.5">
                            <MapPin size={12} color="#94a3b8" />
                            <Text className="text-xs text-slate-400 font-medium" numberOfLines={1}>
                                {item.location}
                            </Text>
                        </View>
    
                        {/* Stats */}
                        <View className="flex-row items-center gap-3 mt-2">
                            <View className="flex-row items-center gap-1">
                                <Eye size={12} color="#94a3b8" />
                                <Text className="text-[10px] font-medium text-slate-500">
                                    {item.viewCount || 0} {(item.viewCount === 1 || !item.viewCount) ? 'View' : 'Views'}
                                </Text>
                            </View>
                            <View className="flex-row items-center gap-1">
                                <MessageCircle size={12} color="#94a3b8" />
                                <Text className="text-[10px] font-medium text-slate-500">
                                    {item.contactCount || 0} {(item.contactCount === 1 || !item.contactCount) ? 'Msg' : 'Msgs'}
                                </Text>
                            </View>
                        </View>
                    </View>
    
                    <View className="flex-row items-end justify-between mt-2">
                        <Text className="text-xl font-black text-indigo-600">
                            €{item.price === 0 ? 'Free' : item.price}
                        </Text>
                        <View className="bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                            <Text className="text-[10px] text-slate-400 font-bold uppercase">
                                {item.marketType === 'housing' ? 'Housing' : 'Item'}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
  )
}

export default MarketPlaceCard