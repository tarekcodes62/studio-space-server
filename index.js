import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { MongoClient, ObjectId } from 'mongodb';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const app = express();
const port = process.env.PORT;

// connect to mongodb
const client = new MongoClient(process.env.DATABASE_URL);
export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log('You successfully connected to MongoDB!');
    return client;
  } catch (err) {
    console.dir(err);
  }
}
const mongodbClient = await connectToMongoDB();
const db = mongodbClient.db('studioSpace');
const studiosCollection = db.collection('studios');
const bookingsCollection = db.collection('bookings');

app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
  res.send('This is Home page');
});

// verify token
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({
      message: 'Unauthorized',
    });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).send({
      message: 'Unauthorized access: Token is missing',
    });
  }
  const JWKS = createRemoteJWKSet(
    new URL(`${process.env.JWKS_URI}/api/auth/jwks`),
  );
  try {
    const { payload } = await jwtVerify(token, JWKS);
    next();
  } catch (error) {
    res.status(500).send({
      message: 'Token verification failed',
    });
  }
};

// featured studios api
app.get('/featured-studios', async (req, res) => {
  const result = await studiosCollection
    .find({})
    .sort({ rating: -1 })
    .limit(6)
    .toArray();
  res.send(result);
});

app.get('/studios', async (req, res) => {
  try {
    const { category } = req.query;

    const categoryMap = {
      'photo-studios': 'Photo Studios',
      'sound-stages': 'Sound Stages',
      'podcast-rooms': 'Podcast Rooms',
      'music-suites': 'Music Suites',
      'art-workshops': 'Art Workshops',
    };

    const filter = categoryMap[category]
      ? { category: categoryMap[category] }
      : {};

    const studios = await studiosCollection.find(filter).toArray();

    res.status(200).send(studios);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch studios' });
  }
});

// studio details api
app.get('/studios/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const studio = await studiosCollection.findOne({
      _id: new ObjectId(id),
    });
    if (!studio) {
      return res.status(404).json({
        message: 'Studio not found',
      });
    }

    res.status(200).send(studio);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch studio',
    });
  }
});

app.post('/my-bookings', verifyToken, async (req, res) => {
  try {
    const booking = req.body;

    const { studioId, bookingDate, startTime, duration } = booking;

    const toMinutes = time => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const newStart = toMinutes(startTime);
    const newEnd = newStart + Number(duration) * 60;

    // Find existing confirmed bookings
    const existingBookings = await bookingsCollection
      .find({
        studioId,
        bookingDate,
        status: 'Pending',
      })
      .toArray();

    // Check time overlap
    const isBooked = existingBookings.some(item => {
      const existingStart = toMinutes(item.startTime);
      const existingEnd = existingStart + Number(item.duration) * 60;

      return newStart < existingEnd && newEnd > existingStart;
    });

    if (isBooked) {
      return res.status(409).send({
        message: 'This studio is already booked for this time.',
      });
    }

    const result = await bookingsCollection.insertOne(booking);

    res.status(201).send({
      message: 'Booking successful!',
    });
  } catch (error) {
    res.status(500).send({
      message: 'Internal server error',
    });
  }
});

// my bookings api
app.get('/my-bookings/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const result = await bookingsCollection.find({ userId: id }).toArray();
  res.send(result);
});

// cancel booking api
app.patch('/my-bookings/:bookingId/cancel', verifyToken, async (req, res) => {
  try {
    const { bookingId } = req.params;

    const result = await bookingsCollection.updateOne(
      {
        _id: new ObjectId(bookingId),
      },
      {
        $set: {
          status: 'Cancelled',
          updatedAt: new Date(),
        },
      },
    );
    res.send(result);
  } catch (error) {
    res.status(500).send({
      message: 'Failed to cancel booking',
    });
  }
});

// add studio api
app.post('/add-studio', verifyToken, async (req, res) => {
  const studio = req.body;
  const result = await studiosCollection.insertOne(studio);
  res.send(result);
});

// my listings api
app.get('/my-listings/:email', verifyToken, async (req, res) => {
  try {
    const { email } = req.params;

    const result = await studiosCollection
      .find({ 'host.email': email })
      .toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({
      message: 'Failed to fetch listings',
    });
  }
});

// delete studio api
app.delete('/studios/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await studiosCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).send({
        message: 'Studio not found',
      });
    }

    res.send({
      message: 'Studio deleted successfully',
    });
  } catch (error) {
    res.status(500).send({
      message: 'Failed to delete studio',
    });
  }
});

app.get('/studios/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.query;

    const studio = await studiosCollection.findOne({
      _id: new ObjectId(id),
      'host.email': email,
    });

    if (!studio) {
      return res.status(404).send({
        message: 'Studio not found',
      });
    }

    res.send(studio);
  } catch (error) {
    res.status(500).send({
      message: 'Failed to fetch studio',
    });
  }
});

// update studio api
app.patch('/studios/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.query;
    const { name, ...data } = req.body;

    if (!email) return res.status(400).send({ message: 'Email required' });

    const result = await studiosCollection.updateOne(
      { _id: new ObjectId(id), 'host.email': email },
      {
        $set: {
          ...data,
          name,
          slug: name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, ''),
          updatedAt: new Date(),
        },
      },
    );

    if (!result.matchedCount)
      return res.status(404).send({ message: 'Studio not found' });

    res.send({ success: true, message: 'Studio updated successfully' });
  } catch (error) {
    res.status(500).send({ message: 'Failed to update studio' });
  }
});

app.get('/dashboard', verifyToken, async (req, res) => {
  try {
    const { email, userId } = req.query;

    if (!email) {
      return res.status(400).send({
        message: 'Email is required',
      });
    }

    // Find logged-in user's studios
    const studios = await studiosCollection
      .find({ 'host.email': email })
      .sort({ createdAt: -1 })
      .toArray();

    // Find bookings for these studios
    const bookings = await bookingsCollection
      .find({ userId: userId })
      .sort({ createdAt: -1 })
      .toArray();

    // Calculate statistics
    const totalStudios = studios.length;

    const totalBookings = bookings.length;

    const pendingBookings = bookings.filter(
      booking => booking.status === 'Pending',
    ).length;

    const totalEarnings = bookings
      .filter(booking => ['Confirmed', 'Completed'].includes(booking.status))
      .reduce((total, booking) => total + Number(booking.totalPrice || 0), 0);

    // Dashboard response
    res.send({
      stats: {
        totalStudios,
        totalBookings,
        pendingBookings,
        totalEarnings,
      },

      recentBookings: bookings.slice(0, 5),

      recentStudios: studios.slice(0, 4),
    });
  } catch (error) {
    res.status(500).send({
      message: 'Failed to load dashboard data',
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});

export default app;
