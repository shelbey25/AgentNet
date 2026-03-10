// Local adapter — handles actions for businesses that use AgentNet
// as their backend (no external endpoint). This is the default adapter.
// It operates directly on the platform database.

import { AdapterResponse } from "./base";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function handleLocalOrder(
  profileId: string,
  payload: Record<string, unknown>
): Promise<AdapterResponse> {
  const items = payload.items as Array<{ id: string; name?: string; qty: number; price?: number }>;
  if (!items || items.length === 0) {
    return { success: false, error: "No items provided", statusCode: 400 };
  }

  // Look up service/menu items from info sections
  const menuInfo = await prisma.infoSection.findFirst({
    where: { profileId, section: "menu" },
  });

  let total = 0;
  const resolvedItems = items.map((item) => {
    let price = item.price || 0;
    if (menuInfo && Array.isArray((menuInfo.data as Record<string, unknown>).items)) {
      const menuItem = ((menuInfo.data as Record<string, unknown>).items as Array<Record<string, unknown>>)
        .find((m) => m.id === item.id);
      if (menuItem && typeof menuItem.price === "number") {
        price = menuItem.price;
      }
    }
    total += price * item.qty;
    return { ...item, price };
  });

  const order = await prisma.order.create({
    data: {
      profileId,
      customerId: (payload.customer_id as string) || null,
      items: resolvedItems,
      total,
      pickupTime: (payload.pickup_time as string) || null,
      notes: (payload.notes as string) || null,
      status: "pending",
    },
  });

  return {
    success: true,
    data: {
      order_id: order.id,
      items: resolvedItems,
      total,
      status: order.status,
      pickup_time: order.pickupTime,
    },
    statusCode: 201,
  };
}

export async function handleLocalBooking(
  profileId: string,
  payload: Record<string, unknown>
): Promise<AdapterResponse> {
  const service = payload.service as string;
  const time = payload.time as string;

  if (!service || !time) {
    return { success: false, error: "service and time are required", statusCode: 400 };
  }

  const dateTime = new Date(time);
  if (isNaN(dateTime.getTime())) {
    return { success: false, error: "Invalid time format", statusCode: 400 };
  }

  // Check for conflicting bookings
  const existing = await prisma.booking.findFirst({
    where: {
      profileId,
      dateTime,
      status: { in: ["pending", "confirmed"] },
    },
  });

  if (existing) {
    return { success: false, error: "Time slot not available", statusCode: 409 };
  }

  // Look up service duration
  const svc = await prisma.service.findFirst({
    where: { profileId, name: { contains: service, mode: "insensitive" } },
  });

  const booking = await prisma.booking.create({
    data: {
      profileId,
      customerId: (payload.customer_id as string) || null,
      service,
      dateTime,
      duration: svc?.duration || (payload.duration as number) || 30,
      notes: (payload.notes as string) || null,
      status: "confirmed",
    },
  });

  return {
    success: true,
    data: {
      booking_id: booking.id,
      service: booking.service,
      date_time: booking.dateTime.toISOString(),
      duration: booking.duration,
      status: booking.status,
    },
    statusCode: 201,
  };
}

export async function handleLocalAvailability(
  profileId: string,
  payload: Record<string, unknown>
): Promise<AdapterResponse> {
  const date = payload.date as string;
  const service = payload.service as string;

  if (!date) {
    return { success: false, error: "date is required", statusCode: 400 };
  }

  // Generate standard business-hour slots
  const startHour = 9;
  const endHour = 17;
  const slotDuration = 30; // minutes

  const dateObj = new Date(date + "T00:00:00");
  const dayOfWeek = dateObj.getDay();

  // No availability on Sundays
  if (dayOfWeek === 0) {
    return { success: true, data: { date, service, slots: [] }, statusCode: 200 };
  }

  // Get existing bookings for that day
  const dayStart = new Date(date + "T00:00:00");
  const dayEnd = new Date(date + "T23:59:59");

  const bookings = await prisma.booking.findMany({
    where: {
      profileId,
      dateTime: { gte: dayStart, lte: dayEnd },
      status: { in: ["pending", "confirmed"] },
    },
  });

  const bookedTimes = new Set(
    bookings.map((b) => {
      const d = new Date(b.dateTime);
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    })
  );

  // Check service duration
  let duration = slotDuration;
  if (service) {
    const svc = await prisma.service.findFirst({
      where: { profileId, name: { contains: service, mode: "insensitive" } },
    });
    if (svc?.duration) duration = svc.duration;
  }

  const slots: string[] = [];
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += duration) {
      const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      if (!bookedTimes.has(timeStr)) {
        slots.push(timeStr);
      }
    }
  }

  return {
    success: true,
    data: { date, service: service || null, slots },
    statusCode: 200,
  };
}

export async function handleLocalQuote(
  profileId: string,
  payload: Record<string, unknown>
): Promise<AdapterResponse> {
  const service = payload.service as string;
  if (!service) {
    return { success: false, error: "service is required", statusCode: 400 };
  }

  // Look up service for base pricing
  const svc = await prisma.service.findFirst({
    where: { profileId, name: { contains: service, mode: "insensitive" } },
  });

  // Generate a rough estimate based on service price
  let estimatedPrice: number | null = null;
  if (svc?.price) {
    const priceMatch = svc.price.match(/\d+/);
    if (priceMatch) estimatedPrice = parseInt(priceMatch[0]);
  }

  const quote = await prisma.quote.create({
    data: {
      profileId,
      requesterId: (payload.requester_id as string) || null,
      service,
      details: payload.details ? (payload.details as Prisma.InputJsonValue) : Prisma.DbNull,
      estimatedPrice,
      notes: svc
        ? `Based on listed price: ${svc.price}. Final price may vary.`
        : "Quote pending business review.",
      status: estimatedPrice ? "sent" : "pending",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  return {
    success: true,
    data: {
      quote_id: quote.id,
      service: quote.service,
      estimated_price: quote.estimatedPrice,
      currency: quote.currency,
      notes: quote.notes,
      status: quote.status,
      expires_at: quote.expiresAt?.toISOString(),
    },
    statusCode: 201,
  };
}

export async function handleLocalServiceRequest(
  profileId: string,
  payload: Record<string, unknown>
): Promise<AdapterResponse> {
  const service = payload.service as string;
  if (!service) {
    return { success: false, error: "service is required", statusCode: 400 };
  }

  const request = await prisma.serviceRequest.create({
    data: {
      profileId,
      requesterId: (payload.requester_id as string) || null,
      service,
      details: payload.details ? (payload.details as Prisma.InputJsonValue) : Prisma.DbNull,
      timePreference: (payload.time_preference as string) || null,
      status: "pending",
    },
  });

  return {
    success: true,
    data: {
      request_id: request.id,
      service: request.service,
      time_preference: request.timePreference,
      status: request.status,
    },
    statusCode: 201,
  };
}
